import os
import re
import subprocess
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
DOCS_DIR = ROOT_DIR / "docs"
MD_FILE = DOCS_DIR / "UDYOGA_COMPLETE_USER_GUIDE_AND_JURY_HANDBOOK.md"
INVENTORY_FILE = DOCS_DIR / "UDYOGA_FEATURE_AND_BUTTON_INVENTORY.md"
HTML_OUT = DOCS_DIR / "UDYOGA_HANDBOOK_RENDER.html"
PDF_OUT = DOCS_DIR / "UDYOGA_COMPLETE_USER_GUIDE_AND_JURY_HANDBOOK.pdf"

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
if not os.path.exists(CHROME_PATH):
    CHROME_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

def markdown_to_html(md_text: str) -> str:
    lines = md_text.splitlines()
    html_lines = []
    in_code = False
    in_table = False
    table_headers = []
    
    for line in lines:
        stripped = line.strip()
        
        # Code fence
        if stripped.startswith("```"):
            if in_code:
                html_lines.append("</code></pre></div>")
                in_code = False
            else:
                lang = stripped[3:].strip()
                html_lines.append(f'<div class="code-wrapper no-break"><div class="code-header">{lang or "terminal"}</div><pre><code>')
                in_code = True
            continue
            
        if in_code:
            escaped = (line.replace("&", "&amp;")
                           .replace("<", "&lt;")
                           .replace(">", "&gt;"))
            html_lines.append(escaped)
            continue
            
        # Table row
        if "|" in line and (line.startswith("|") or line.endswith("|")):
            cells = [c.strip() for c in line.split("|")[1:-1]]
            if not in_table:
                in_table = True
                html_lines.append('<div class="table-container no-break"><table>')
                html_lines.append("<thead><tr>")
                for c in cells:
                    html_lines.append(f"<th>{inline_format(c)}</th>")
                html_lines.append("</tr></thead><tbody>")
                continue
            else:
                # Check if it's separator row
                if all(re.match(r"^:?-+:?$", c) for c in cells):
                    continue
                html_lines.append("<tr>")
                for c in cells:
                    cell_html = inline_format(c)
                    # Add status badge classes
                    if "FUNCTIONAL" in c and "PARTIALLY" not in c:
                        cell_html = cell_html.replace("FUNCTIONAL", '<span class="badge badge-success">FUNCTIONAL</span>')
                    elif "PARTIALLY FUNCTIONAL" in c:
                        cell_html = cell_html.replace("PARTIALLY FUNCTIONAL", '<span class="badge badge-warning">PARTIAL</span>')
                    elif "DEMO / MOCK" in c:
                        cell_html = cell_html.replace("DEMO / MOCK", '<span class="badge badge-info">DEMO / MOCK</span>')
                    elif "DECORATIVE" in c:
                        cell_html = cell_html.replace("DECORATIVE", '<span class="badge badge-secondary">DECORATIVE</span>')
                    html_lines.append(f"<td>{cell_html}</td>")
                html_lines.append("</tr>")
                continue
        else:
            if in_table:
                html_lines.append("</tbody></table></div>")
                in_table = False

        if not stripped:
            continue

        # Major Headings with Page Breaks
        if stripped.startswith("# PART "):
            part_title = stripped[2:].strip()
            html_lines.append(f'<div class="page-break"></div><div class="part-banner"><h1 class="part-title">{inline_format(part_title)}</h1></div>')
            continue
        elif stripped.startswith("# "):
            html_lines.append(f'<h1 class="h1-title">{inline_format(stripped[2:])}</h1>')
            continue
        elif stripped.startswith("## "):
            html_lines.append(f'<h2 class="h2-title">{inline_format(stripped[3:])}</h2>')
            continue
        elif stripped.startswith("### "):
            html_lines.append(f'<h3 class="h3-title">{inline_format(stripped[4:])}</h3>')
            continue
        elif stripped.startswith("#### "):
            html_lines.append(f'<h4 class="h4-title">{inline_format(stripped[5:])}</h4>')
            continue

        # Blockquote / Callout
        if stripped.startswith("> "):
            callout_text = stripped[2:].strip()
            if callout_text.startswith("[!IMPORTANT]"):
                html_lines.append(f'<div class="callout callout-important no-break"><div class="callout-tag">REGULATORY POLICY GUARANTEE</div><p>{inline_format(callout_text.replace("[!IMPORTANT]", "").strip())}</p></div>')
            elif callout_text.startswith("[!NOTE]"):
                html_lines.append(f'<div class="callout callout-note no-break"><div class="callout-tag">TECHNICAL ARCHITECTURE NOTE</div><p>{inline_format(callout_text.replace("[!NOTE]", "").strip())}</p></div>')
            elif callout_text.startswith("[!TIP]"):
                html_lines.append(f'<div class="callout callout-tip no-break"><div class="callout-tag">PRESENTATION TIP FOR JURY</div><p>{inline_format(callout_text.replace("[!TIP]", "").strip())}</p></div>')
            else:
                html_lines.append(f'<blockquote class="no-break"><p>{inline_format(callout_text)}</p></blockquote>')
            continue

        # Lists
        if stripped.startswith("- ") or stripped.startswith("* "):
            html_lines.append(f'<li class="bullet-item">{inline_format(stripped[2:])}</li>')
            continue
        if re.match(r"^\d+\.\s", stripped):
            item_text = re.sub(r"^\d+\.\s", "", stripped)
            html_lines.append(f'<li class="ordered-item">{inline_format(item_text)}</li>')
            continue

        # Normal Paragraph
        html_lines.append(f'<p>{inline_format(stripped)}</p>')

    if in_table:
        html_lines.append("</tbody></table></div>")
    if in_code:
        html_lines.append("</code></pre></div>")

    return "\n".join(html_lines)

def inline_format(text: str) -> str:
    # Math expressions
    text = re.sub(r"\$\$(.+?)\$\$", r'<div class="math-display">\1</div>', text)
    text = re.sub(r"\$(.+?)\$", r'<span class="math-inline">\1</span>', text)
    
    # Bold & Italic
    text = re.sub(r"\*\*\*(.+?)\*\*\*", r"<strong><em>\1</em></strong>", text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"\*(.+?)\*", r"<em>\1</em>", text)
    
    # Inline code
    text = re.sub(r"`(.+?)`", r'<code class="inline-code">\1</code>', text)
    
    # Links
    text = re.sub(r"\[(.+?)\]\((.+?)\)", r'<a href="\2">\1</a>', text)
    return text

def build_complete_html():
    with open(MD_FILE, "r", encoding="utf-8") as f:
        handbook_md = f.read()

    body_html = markdown_to_html(handbook_md)

    html_document = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>UDYOGA — Complete Application User Guide & Hackathon Jury Handbook</title>
<style>
    @page {{
        size: A4 portrait;
        margin: 20mm 15mm 20mm 15mm;
        @top-right {{
            content: "UDYOGA Technical Handbook";
            font-size: 8pt;
            color: #64748b;
        }}
        @bottom-right {{
            content: "Page " counter(page);
            font-size: 8pt;
            color: #64748b;
        }}
    }}

    body {{
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        color: #1e293b;
        line-height: 1.55;
        font-size: 9.5pt;
        background-color: #ffffff;
        margin: 0;
        padding: 0;
    }}

    /* Cover Page */
    .cover-page {{
        page-break-after: always;
        height: 100vh;
        background: linear-gradient(135deg, #091322 0%, #0d2137 60%, #08434d 100%);
        color: #ffffff;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 60px 45px;
        box-sizing: border-box;
    }}

    .cover-top {{
        border-bottom: 2px solid #14b8a6;
        padding-bottom: 25px;
    }}

    .cover-badge {{
        display: inline-block;
        background: rgba(20, 184, 166, 0.2);
        border: 1px solid #14b8a6;
        color: #5eead4;
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 9pt;
        font-weight: 700;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        margin-bottom: 15px;
    }}

    .cover-title {{
        font-size: 34pt;
        font-weight: 900;
        letter-spacing: -1px;
        margin: 10px 0;
        color: #f8fafc;
        line-height: 1.1;
    }}

    .cover-subtitle {{
        font-size: 15pt;
        font-weight: 400;
        color: #94a3b8;
        margin: 12px 0 6px 0;
    }}

    .cover-sub-subtitle {{
        font-size: 11pt;
        color: #5eead4;
        font-weight: 600;
        margin-top: 5px;
    }}

    .cover-middle {{
        margin: 40px 0;
    }}

    .cover-card {{
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 15px;
    }}

    .cover-card h3 {{
        color: #5eead4;
        margin-top: 0;
        margin-bottom: 8px;
        font-size: 12pt;
    }}

    .cover-card p {{
        color: #cbd5e1;
        font-size: 9.5pt;
        margin: 0;
    }}

    .cover-footer {{
        border-top: 1px solid rgba(255, 255, 255, 0.15);
        padding-top: 20px;
        display: flex;
        justify-content: space-between;
        font-size: 8.5pt;
        color: #94a3b8;
    }}

    /* Typography & Section Titles */
    .part-banner {{
        background: #0f172a;
        color: #ffffff;
        padding: 18px 24px;
        border-left: 6px solid #14b8a6;
        border-radius: 4px;
        margin-top: 25px;
        margin-bottom: 20px;
    }}

    .part-title {{
        font-size: 16pt;
        font-weight: 800;
        margin: 0;
        letter-spacing: -0.3px;
        color: #ffffff;
    }}

    .h1-title {{
        font-size: 15pt;
        color: #0f172a;
        border-bottom: 2px solid #e2e8f0;
        padding-bottom: 6px;
        margin-top: 24px;
        margin-bottom: 14px;
    }}

    .h2-title {{
        font-size: 12pt;
        color: #0f766e;
        margin-top: 20px;
        margin-bottom: 10px;
        font-weight: 700;
    }}

    .h3-title {{
        font-size: 10.5pt;
        color: #1e293b;
        margin-top: 14px;
        margin-bottom: 8px;
        font-weight: 700;
    }}

    .h4-title {{
        font-size: 9.5pt;
        color: #475569;
        margin-top: 10px;
        margin-bottom: 6px;
        font-weight: 700;
    }}

    p {{
        margin-top: 0;
        margin-bottom: 10px;
        text-align: justify;
    }}

    /* Tables */
    .table-container {{
        margin: 14px 0;
        width: 100%;
        overflow-x: auto;
    }}

    table {{
        width: 100%;
        border-collapse: collapse;
        font-size: 8pt;
        border: 1px solid #cbd5e1;
    }}

    thead th {{
        background-color: #0f2b3c;
        color: #ffffff;
        font-weight: 700;
        text-align: left;
        padding: 8px 10px;
        border: 1px solid #0f2b3c;
    }}

    tbody td {{
        padding: 6px 10px;
        border: 1px solid #e2e8f0;
        vertical-align: top;
    }}

    tbody tr:nth-child(even) {{
        background-color: #f8fafc;
    }}

    /* Badges */
    .badge {{
        display: inline-block;
        padding: 2px 7px;
        border-radius: 10px;
        font-size: 7.5pt;
        font-weight: 700;
        text-transform: uppercase;
    }}
    .badge-success {{ background: #dcfce7; color: #15803d; border: 1px solid #86efac; }}
    .badge-warning {{ background: #fef9c3; color: #854d0e; border: 1px solid #fde047; }}
    .badge-info {{ background: #e0f2fe; color: #0369a1; border: 1px solid #7dd3fc; }}
    .badge-secondary {{ background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }}

    /* Callouts */
    .callout {{
        border-left: 4px solid #14b8a6;
        background: #f0fdfa;
        padding: 12px 16px;
        margin: 14px 0;
        border-radius: 0 4px 4px 0;
    }}
    .callout-important {{
        border-left-color: #e11d48;
        background: #fff1f2;
    }}
    .callout-note {{
        border-left-color: #0284c7;
        background: #f0f9ff;
    }}
    .callout-tip {{
        border-left-color: #059669;
        background: #ecfdf5;
    }}
    .callout-tag {{
        font-size: 7.5pt;
        font-weight: 800;
        letter-spacing: 0.8px;
        color: #0f766e;
        margin-bottom: 4px;
        text-transform: uppercase;
    }}
    .callout-important .callout-tag {{ color: #be123c; }}
    .callout-note .callout-tag {{ color: #0369a1; }}
    .callout-tip .callout-tag {{ color: #047857; }}

    /* Code Blocks */
    .code-wrapper {{
        background: #0f172a;
        border-radius: 4px;
        margin: 12px 0;
        overflow: hidden;
    }}
    .code-header {{
        background: #1e293b;
        color: #94a3b8;
        font-size: 7.5pt;
        padding: 4px 10px;
        font-weight: 600;
        text-transform: uppercase;
        border-bottom: 1px solid #334155;
    }}
    pre {{
        margin: 0;
        padding: 10px 14px;
        color: #f8fafc;
        font-family: Consolas, "Courier New", monospace;
        font-size: 7.5pt;
        line-height: 1.45;
        overflow-x: auto;
    }}
    .inline-code {{
        background: #f1f5f9;
        color: #0f766e;
        padding: 1px 5px;
        border-radius: 3px;
        font-family: Consolas, monospace;
        font-size: 8.5pt;
        border: 1px solid #e2e8f0;
    }}

    /* Math */
    .math-display {{
        background: #f8fafc;
        border-left: 3px solid #0d9488;
        padding: 8px 14px;
        margin: 10px 0;
        font-family: "Cambria Math", serif;
        font-size: 9.5pt;
        color: #0f172a;
        font-weight: 600;
    }}
    .math-inline {{
        font-family: "Cambria Math", serif;
        font-weight: 600;
        color: #0f766e;
    }}

    /* Lists */
    li {{
        margin-bottom: 4px;
    }}

    .page-break {{
        page-break-before: always;
    }}
    .no-break {{
        page-break-inside: avoid;
    }}
</style>
</head>
<body>

<!-- Cover Page -->
<div class="cover-page">
    <div class="cover-top">
        <span class="cover-badge">HACKATHON JURY & ARCHITECTURE HANDBOOK</span>
        <div class="cover-title">UDYOGA</div>
        <div class="cover-subtitle">Beyond Credit. Beyond Barriers.</div>
        <div class="cover-sub-subtitle">Complete Application User Guide, Feature Explanation & Technical Jury Handbook</div>
    </div>

    <div class="cover-middle">
        <div class="cover-card">
            <h3>Every Screen. Every Button. Every Feature. Every Agent. Explained.</h3>
            <p>An exhaustive, code-verified operating manual and technical defense handbook for evaluating India's first agentic AI financial intelligence and cash-flow resilience lending platform for credit-invisible MSMEs.</p>
        </div>
        <div class="cover-card">
            <h3>Key System Highlights Verified:</h3>
            <p><strong>88/88 Backend Tests Passing (100%)</strong> &bull; 7 Asynchronous AI Agents &bull; 100% Deterministic Arithmetic (Decimal) &bull; NetworkX Graph Forensics &bull; SQLite WAL Mode Persistence &bull; JWT Authentication & RBAC &bull; RBI Fair Practices Compliance</p>
        </div>
    </div>

    <div class="cover-footer">
        <div><strong>Architect & Tech Lead:</strong> Atharv &nbsp;|&nbsp; <strong>Frontend Lead:</strong> Bharath</div>
        <div><strong>Version:</strong> 2.0-Production-Hardened &nbsp;|&nbsp; <strong>Date:</strong> November 2026</div>
    </div>
</div>

<!-- Main Body -->
<div class="content-body">
{body_html}
</div>

</body>
</html>
"""
    with open(HTML_OUT, "w", encoding="utf-8") as f:
        f.write(html_document)
    print(f"HTML rendered successfully to {HTML_OUT}")

def compile_pdf():
    file_uri = "file:///" + str(HTML_OUT).replace("\\", "/")
    cmd = [
        CHROME_PATH,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        f"--print-to-pdf={str(PDF_OUT)}",
        file_uri
    ]
    print(f"Compiling PDF via {CHROME_PATH}...")
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Error compiling PDF: {res.stderr}")
    else:
        print(f"PDF successfully compiled to {PDF_OUT}")

if __name__ == "__main__":
    build_complete_html()
    compile_pdf()
