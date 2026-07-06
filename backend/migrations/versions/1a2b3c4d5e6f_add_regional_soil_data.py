"""add regional soil data and soil type

Revision ID: 1a2b3c4d5e6f
Revises: 59ff470bed94
Create Date: 2026-07-05 17:55:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '1a2b3c4d5e6f'
down_revision = '59ff470bed94'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Add soil_type to farmers table
    op.add_column('farmers', sa.Column('soil_type', sa.String(), nullable=True))
    
    # Create regional_soil_data table
    op.create_table('regional_soil_data',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('state', sa.String(length=100), nullable=False),
        sa.Column('district', sa.String(length=100), nullable=False),
        sa.Column('avg_nitrogen', sa.Float(), nullable=True),
        sa.Column('avg_phosphorus', sa.Float(), nullable=True),
        sa.Column('avg_potassium', sa.Float(), nullable=True),
        sa.Column('avg_ph', sa.Float(), nullable=True),
        sa.Column('avg_temperature', sa.Float(), nullable=True),
        sa.Column('avg_humidity', sa.Float(), nullable=True),
        sa.Column('avg_rainfall', sa.Float(), nullable=True),
        sa.Column('season', sa.String(length=20), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_regional_soil_data_district'), 'regional_soil_data', ['district'], unique=False)
    op.create_index(op.f('ix_regional_soil_data_id'), 'regional_soil_data', ['id'], unique=False)
    op.create_index(op.f('ix_regional_soil_data_season'), 'regional_soil_data', ['season'], unique=False)
    op.create_index(op.f('ix_regional_soil_data_state'), 'regional_soil_data', ['state'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_regional_soil_data_state'), table_name='regional_soil_data')
    op.drop_index(op.f('ix_regional_soil_data_season'), table_name='regional_soil_data')
    op.drop_index(op.f('ix_regional_soil_data_id'), table_name='regional_soil_data')
    op.drop_index(op.f('ix_regional_soil_data_district'), table_name='regional_soil_data')
    op.drop_table('regional_soil_data')
    op.drop_column('farmers', 'soil_type')
