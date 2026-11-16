"""Table names and other deployment settings read from the environment."""

from __future__ import annotations

import os

USER_PROFILE_TABLE_PREFIX = os.getenv("USER_PROFILE_TABLE_PREFIX", "user_profile").strip() or "user_profile"


USER_REGISTRATION_TABLE = f"{USER_PROFILE_TABLE_PREFIX}_registration"


USER_ROLE_TABLE = f"{USER_PROFILE_TABLE_PREFIX}_userrole"


DONOR_TABLE = os.getenv("DONOR_TABLE", "donor").strip() or "donor"


