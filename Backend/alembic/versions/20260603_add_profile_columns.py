"""add profile columns

Revision ID: 20260603_add_profile_columns
Revises: 
Create Date: 2026-06-03 13:00:00

"""
from alembic import op
import sqlalchemy as sa

revision = "20260603_add_profile_columns"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("users", sa.Column("website", sa.String(length=200), nullable=False, server_default=""))
    op.add_column("users", sa.Column("twitter", sa.String(length=200), nullable=False, server_default=""))
    op.add_column("users", sa.Column("longest_streak", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("users", sa.Column("focus_hours", sa.Integer(), nullable=False, server_default="0"))


def downgrade():
    op.drop_column("users", "focus_hours")
    op.drop_column("users", "longest_streak")
    op.drop_column("users", "twitter")
    op.drop_column("users", "website")