using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Utilidades.Domain.Entities;

namespace Utilidades.Infrastructure.Persistence.Configurations;

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.ToTable("refresh_tokens");

        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).HasColumnName("id");
        builder.Property(t => t.UserId).HasColumnName("user_id").IsRequired();
        builder.Property(t => t.Token).HasColumnName("token").HasMaxLength(512).IsRequired();
        builder.Property(t => t.JwtId).HasColumnName("jwt_id").HasMaxLength(256).IsRequired();
        builder.Property(t => t.ExpiryDate).HasColumnName("expiry_date").IsRequired();
        builder.Property(t => t.IsRevoked).HasColumnName("is_revoked").HasDefaultValue(false);
        builder.Property(t => t.RevokedByIp).HasColumnName("revoked_by_ip").HasMaxLength(64);
        builder.Property(t => t.RevokedAt).HasColumnName("revoked_at");
        builder.Property(t => t.ReplacedByToken).HasColumnName("replaced_by_token").HasMaxLength(512);
        builder.Property(t => t.RevokeReason).HasColumnName("revoke_reason").HasMaxLength(256);
        builder.Property(t => t.CreatedByIp).HasColumnName("created_by_ip").HasMaxLength(64).IsRequired();
        builder.Property(t => t.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(t => t.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false);
        builder.Ignore(t => t.UpdatedAt);
        builder.Ignore(t => t.UpdatedBy);
        builder.Ignore(t => t.CreatedBy);
        builder.Ignore(t => t.DeletedAt);
        builder.Ignore(t => t.DeletedBy);

        builder.HasIndex(t => t.Token).HasDatabaseName("ix_refresh_tokens_token");
        builder.HasIndex(t => t.UserId).HasDatabaseName("ix_refresh_tokens_user_id");
        builder.HasIndex(t => t.ExpiryDate).HasDatabaseName("ix_refresh_tokens_expiry");
    }
}
