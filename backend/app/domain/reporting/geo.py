"""Indian state name normalisation used by impact reports."""

from __future__ import annotations




VALID_INDIAN_STATES = {
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", 
    "West Bengal", "Delhi", "Jammu and Kashmir", "Puducherry", "Ladakh", "Chandigarh", 
    "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep", "Andaman and Nicobar Islands"
}


def normalize_state_name(raw_state: str) -> str:
    if not raw_state:
        return ""
    s = raw_state.strip().upper()
    if "DELHI" in s:
        return "Delhi"
    if "PONDICHERRY" in s or "PUDUCHERRY" in s:
        return "Puducherry"
    if s.startswith("MAHA"):
        return "Maharashtra"
    if s.startswith("JAM") or "KASHMIR" in s:
        return "Jammu and Kashmir"
    if s.startswith("RAJ"):
        return "Rajasthan"
    if s.startswith("TEL"):
        return "Telangana"
    if s.startswith("KER"):
        return "Kerala"
    if s.startswith("KAR"):
        return "Karnataka"
    if s.startswith("MAD") or s == "MP":
        return "Madhya Pradesh"
    if s.startswith("UTT") or s == "UP":
        if "PRADESH" in s or s == "UP":
            return "Uttar Pradesh"
        else:
            return "Uttarakhand"
    if s.startswith("BIH"):
        return "Bihar"
    if s.startswith("ODI") or s.startswith("ORI"):
        return "Odisha"
    if s.startswith("CHH") or s.startswith("CHI"):
        return "Chhattisgarh"
    if s.startswith("WES") or "BENGAL" in s or s == "WB":
        return "West Bengal"
    if s.startswith("GUJ"):
        return "Gujarat"
    if s.startswith("TAM") or s == "TN":
        return "Tamil Nadu"
    if s.startswith("ASS"):
        return "Assam"
    if s.startswith("HAR"):
        return "Haryana"
    if s.startswith("JHA"):
        return "Jharkhand"
    if s.startswith("PUN"):
        return "Punjab"
    if s.startswith("HIM") or s == "HP":
        return "Himachal Pradesh"
    if s.startswith("ARU"):
        return "Arunachal Pradesh"
    
    title_state = raw_state.strip().title()
    return title_state if title_state in VALID_INDIAN_STATES else ""
