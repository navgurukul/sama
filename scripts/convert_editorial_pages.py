import os
import re
import json

IMGS = {
    "aritra": "img/aritra.jpg", "bfg-finalists": "img/bfg-finalists.jpg", "bfg-g01": "img/bfg-g01.jpg", 
    "bfg-g02": "img/bfg-g02.jpg", "bfg-g03": "img/bfg-g03.jpg", "bfg-g04": "img/bfg-g04.jpg", 
    "bfg-g05": "img/bfg-g05.jpg", "bfg-g06": "img/bfg-g06.jpg", "bfg-g07": "img/bfg-g07.jpg", 
    "bfg-g08": "img/bfg-g08.jpg", "bfg-g09": "img/bfg-g09.jpg", "bfg-g10": "img/bfg-g10.jpg", 
    "bhavik": "img/bhavik.jpg", "brendon": "img/brendon.jpg", "builder-1": "img/builder-1.jpg", 
    "builder-2": "img/builder-2.jpg", "builder-3": "img/builder-3.jpg", "builder-4": "img/builder-4.jpg", 
    "builder-5": "img/builder-5.jpg", "chelsy": "img/chelsy.jpg", "college-lab": "img/college-lab.jpg", 
    "faces": "img/faces.jpg", "fl-n1": "img/fl-n1.jpg", "fl-n2": "img/fl-n2.jpg", "fl-n3": "img/fl-n3.jpg", 
    "fl-n4": "img/fl-n4.jpg", "fl-n5": "img/fl-n5.jpg", "fl-n6": "img/fl-n6.jpg", "fl-n7": "img/fl-n7.jpg", 
    "fl-n8": "img/fl-n8.jpg", "manisha": "img/manisha.jpg", "naina": "img/naina.jpg", 
    "renew-desk": "img/renew-desk.jpg", "saathi-kendra": "img/saathi-kendra.jpg", 
    "school-handover": "img/school-handover.jpg", "shrutika": "img/shrutika.jpg", "shweta": "img/shweta.jpg", 
    "smriti": "img/smriti.jpg", "soumili": "img/soumili.jpg", "students-lab": "img/students-lab.jpg", 
    "team-backdrop": "img/team-backdrop.jpg", "win-carronade": "img/win-carronade.jpg", 
    "win-food360": "img/win-food360.jpg", "win-swasthyatap": "img/win-swasthyatap.jpg", 
    "logo-light": "img/logo-light.png", "logo": "img/logo.png", "p-accenture": "img/p-accenture.png", 
    "p-amazon": "img/p-amazon.png", "p-apexon": "img/p-apexon.png", "p-avid": "img/p-avid.png", 
    "p-dxc": "img/p-dxc.png", "p-eaton": "img/p-eaton.png", "p-macquarie": "img/p-macquarie.png", 
    "p-microsoft": "img/p-microsoft.png", "p-sp-global": "img/p-sp-global.png", 
    "p-tiger-analytics": "img/p-tiger-analytics.png", "proc-analytics": "img/proc-analytics.png", 
    "proc-capture": "img/proc-capture.png", "proc-collect": "img/proc-collect.png", 
    "proc-connect": "img/proc-connect.png", "proc-ecosystem": "img/proc-ecosystem.png", 
    "proc-livelihood": "img/proc-livelihood.png", "proc-restore": "img/proc-restore.png", 
    "proc-secure": "img/proc-secure.png", "p-capgemini": "img/p-capgemini.svg", 
    "p-fossil": "img/p-fossil.svg", "p-sga": "img/p-sga.svg"
}

LINK_MAP = {
    "#home": "/",
    "#initiatives": "/initiatives",
    "#saathi": "/sama-saathi",
    "#labs": "/labs",
    "#giving": "/giving",
    "#giving:employee": "/giving#employee",
    "#firstlaptop": "/first-laptop",
    "#bfg": "/bfg",
    "#team": "/ourteam",
    "#comms": "/comms",
    "#comms:reports": "/comms#reports",
    "#involved": "/donate",
    "#involved:give": "/donate",
    "#contact": "/contact",
    "#corporate": "/corporatepartner",
    "#blog1": "/blog/beyond-connectivity",
    "#blog2": "/blog/from-e-waste-to-new-beginnings",
    "#blog3": "/blog/rethinking-digital-inclusion",
}

def css_to_jsx(style_str):
    props = []
    for item in style_str.split(';'):
        item = item.strip()
        if not item or ':' not in item:
            continue
        k, v = item.split(':', 1)
        k = k.strip()
        v = v.strip()
        # CamelCase
        k_parts = k.split('-')
        k_camel = k_parts[0] + ''.join(x.title() for x in k_parts[1:])
        props.append(f"{k_camel}: '{v}'")
    return "{{ " + ", ".join(props) + " }}"

def convert_html_to_jsx(html, page_id):
    # 1. Comments
    html = re.sub(r'<!--(.*?)-->', r'{/* \1 */}', html, flags=re.DOTALL)

    # 2. Images with data-img
    def replace_data_img(match):
        full = match.group(0)
        img_key_m = re.search(r'data-img="([^"]+)"', full)
        if img_key_m:
            key = img_key_m.group(1)
            src_val = "/" + IMGS.get(key, f"img/{key}.jpg")
            full = re.sub(r'src="[^"]*"', f'src="{src_val}"', full)
            full = re.sub(r'\s*data-img="[^"]*"', '', full)
        return full

    html = re.sub(r'<img[^>]+>', replace_data_img, html)

    # Any other img src="img/..." -> src="/img/..."
    html = re.sub(r'src="img/', r'src="/img/', html)
    # Docs href="docs/..." -> href="/docs/..."
    html = re.sub(r'href="docs/', r'href="/docs/', html)

    # 3. Attributes
    html = re.sub(r'\bclass="', r'className="', html)
    html = re.sub(r'\bfor="', r'htmlFor="', html)
    html = re.sub(r'\btabindex="', r'tabIndex="', html)
    html = re.sub(r'\bautocomplete="', r'autoComplete="', html)
    html = re.sub(r'\bstroke-width="', r'strokeWidth="', html)
    html = re.sub(r'\bstroke-linecap="', r'strokeLinecap="', html)
    html = re.sub(r'\bstroke-linejoin="', r'strokeLinejoin="', html)
    html = re.sub(r'\bfill-rule="', r'fillRule="', html)
    html = re.sub(r'\bclip-rule="', r'clipRule="', html)

    # 4. Convert style="..."
    def style_repl(m):
        raw_style = m.group(1)
        jsx_style = css_to_jsx(raw_style)
        return f"style={jsx_style}"

    html = re.sub(r'style="([^"]+)"', style_repl, html)

    # 5. Void elements closing
    # img
    html = re.sub(r'(<img\b(?![^>]*/>)[^>]*)(>)', r'\1 />', html)
    # input
    html = re.sub(r'(<input\b(?![^>]*/>)[^>]*)(>)', r'\1 />', html)
    # br
    html = re.sub(r'<br\s*>', r'<br />', html)
    # hr
    html = re.sub(r'<hr\s*>', r'<hr />', html)

    # 6. Convert internal navigation <a href="#page"> to <Link to="...">
    # Links with external or anchor or mailto or download stay as <a>
    def link_repl(match):
        full = match.group(0)
        href_m = re.search(r'href="([^"]+)"', full)
        if not href_m:
            return full
        target = href_m.group(1)
        if target in LINK_MAP:
            new_dest = LINK_MAP[target]
            return re.sub(r'\bhref="[^"]+"', f'to="{new_dest}"', full).replace('<a ', '<Link ')
        return full

    html = re.sub(r'<a\s+[^>]*href="([^"]+)"[^>]*>', link_repl, html)

    # Replace closing </a> that corresponds to <Link> if we used <Link
    # But doing global replacement of </a> could break external links.
    # So let us replace <Link ...>...</Link> properly or keep <a> with Link replacement.
    # Actually, in React Router, Link renders an <a> tag! So `<Link to="...">...</Link>`.
    return html

def main():
    with open("../sama-firebase/public/index.html", "r", encoding="utf-8") as f:
        content = f.read()

    os.makedirs("src/Pages/Editorial", exist_ok=True)

    pattern = re.compile(r"(<div class=\"page\" id=\"page-([^\"]+)\" data-title=\"([^\"]+)\" hidden>)(.*?)(?=(?:<div class=\"page\" id=\"page-|<footer class=\"site-footer\"))", re.DOTALL)
    matches = pattern.findall(content)

    comp_name_map = {
        "home": ("EditorialHome", "Sama Digital Foundation | A laptop’s second life. Someone’s first."),
        "initiatives": ("Initiatives", "Our Initiatives | Sama"),
        "saathi": ("SamaSaathi", "Sama Saathi Programme | Sama"),
        "labs": ("AiLabs", "Digital Inclusion & AI Literacy Labs | Sama"),
        "bfg": ("BuildForGood", "Build for Good 2026 | Sama"),
        "giving": ("GivingBack", "Giving Back | Sama"),
        "firstlaptop": ("FirstLaptop", "First Laptop, Next Builder | Sama"),
        "comms": ("Communications", "Communications | Sama"),
        "involved": ("EditorialDonate", "Donate | Sama"),
        "blog1": ("BlogBeyondConnectivity", "Beyond Connectivity | Sama"),
        "blog2": ("BlogEWaste", "From E-Waste to New Beginnings | Sama"),
        "blog3": ("BlogRethinkingInclusion", "Rethinking Digital Inclusion | Sama"),
        "contact": ("EditorialContact", "Contact Us | Sama"),
        "corporate": ("EditorialCorporate", "NGO Information | Sama"),
        "team": ("EditorialTeam", "Team | Sama"),
    }

    for _, page_id, raw_title, body_html in matches:
        if page_id not in comp_name_map:
            continue
        comp_name, title = comp_name_map[page_id]
        
        # Remove outer page wrapper and main
        body_trimmed = body_html.strip()
        body_trimmed = re.sub(r'</main\s*>', '', body_trimmed, flags=re.IGNORECASE).strip()
        if page_id == "team":
            # For team, there was an extra page closing </div> and </main>
            body_trimmed = re.sub(r'</div>\s*$', '', body_trimmed).strip()
        if body_trimmed.endswith("</div>"):
            body_trimmed = body_trimmed[:-6].strip()

        # Add rel="noreferrer" to target="_blank"
        body_trimmed = re.sub(r'target="_blank"(?!\s*rel=)', r'target="_blank" rel="noreferrer"', body_trimmed)

        jsx_body = convert_html_to_jsx(body_trimmed, page_id)

        # Fix matching closing tags for <Link>
        # A simple pass: if line/tag opened with <Link, we make sure its closing </a> becomes </Link>
        # To be completely safe and avoid mismatch, we can define a small helper <EditorialLink> or use Link.
        # Even simpler: in JSX, `import { Link } from "react-router-dom"`.
        # When we converted `<a ... to="..."` to `<Link ... to="..."`, we can match `<Link ...>(.*?)</a` and replace with `</Link>`.
        jsx_body = re.sub(r'(<Link\b[^>]*>(?:(?!<Link\b).)*?)</a\s*>', r'\1</Link>', jsx_body, flags=re.DOTALL)

        comp_code = f"""import React, {{ useEffect }} from 'react';
import {{ Link }} from 'react-router-dom';
import useReveal from '../../components/Editorial/useReveal';
import '../../styles/editorial.css';

export default function {comp_name}() {{
  useReveal();

  useEffect(() => {{
    document.title = "{title}";
    window.scrollTo(0, 0);
  }}, []);

  return (
    <div className="editorial-page page" id="page-{page_id}">
{jsx_body}
    </div>
  );
}}
"""
        out_path = f"src/Pages/Editorial/{comp_name}.jsx"
        with open(out_path, "w", encoding="utf-8") as out_f:
            out_f.write(comp_code)
        print(f"Generated {out_path} ({len(comp_code)} chars)")

if __name__ == "__main__":
    main()
