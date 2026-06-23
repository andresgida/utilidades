using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Utilidades.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "public");

            migrationBuilder.CreateTable(
                name: "device_catalog",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    brand = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    release_year = table.Column<int>(type: "integer", nullable: false),
                    max_cycles = table.Column<int>(type: "integer", nullable: false, defaultValue: 1000),
                    is_official = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    image_url = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_device_catalog", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    first_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    last_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    password_hash = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                    role = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    last_login_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    mfa_secret = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    mfa_enabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_by = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    updated_by = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "apple_devices",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    device_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    catalog_device_id = table.Column<Guid>(type: "uuid", nullable: true),
                    purchase_date = table.Column<DateOnly>(type: "date", nullable: false),
                    is_custom_device = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_by = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    updated_by = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_apple_devices", x => x.id);
                    table.ForeignKey(
                        name: "FK_apple_devices_device_catalog_catalog_device_id",
                        column: x => x.catalog_device_id,
                        principalSchema: "public",
                        principalTable: "device_catalog",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_apple_devices_users_user_id",
                        column: x => x.user_id,
                        principalSchema: "public",
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "refresh_tokens",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    token = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                    jwt_id = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    expiry_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    is_revoked = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    revoked_by_ip = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    revoked_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    replaced_by_token = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                    revoke_reason = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    created_by_ip = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_refresh_tokens", x => x.id);
                    table.ForeignKey(
                        name: "FK_refresh_tokens_users_user_id",
                        column: x => x.user_id,
                        principalSchema: "public",
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "vehicles",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    brand = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    model = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    year = table.Column<int>(type: "integer", nullable: false),
                    license_plate = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    start_count_date = table.Column<DateOnly>(type: "date", nullable: false),
                    base_mileage = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_by = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    updated_by = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_vehicles", x => x.id);
                    table.ForeignKey(
                        name: "FK_vehicles_users_user_id",
                        column: x => x.user_id,
                        principalSchema: "public",
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "battery_cycle_records",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    apple_device_id = table.Column<Guid>(type: "uuid", nullable: false),
                    record_date = table.Column<DateOnly>(type: "date", nullable: false),
                    current_cycles = table.Column<int>(type: "integer", nullable: false),
                    notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_battery_cycle_records", x => x.id);
                    table.ForeignKey(
                        name: "FK_battery_cycle_records_apple_devices_apple_device_id",
                        column: x => x.apple_device_id,
                        principalSchema: "public",
                        principalTable: "apple_devices",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "mileage_records",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    vehicle_id = table.Column<Guid>(type: "uuid", nullable: false),
                    record_date = table.Column<DateOnly>(type: "date", nullable: false),
                    current_mileage = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    observations = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_mileage_records", x => x.id);
                    table.ForeignKey(
                        name: "FK_mileage_records_vehicles_vehicle_id",
                        column: x => x.vehicle_id,
                        principalSchema: "public",
                        principalTable: "vehicles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                schema: "public",
                table: "device_catalog",
                columns: new[] { "id", "brand", "created_at", "image_url", "is_official", "max_cycles", "name", "release_year", "sort_order" },
                values: new object[,]
                {
                    { new Guid("10000000-0000-0000-0000-000000000001"), "Apple", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, 1000, "iPhone 13", 2021, 1 },
                    { new Guid("10000000-0000-0000-0000-000000000002"), "Apple", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, 1000, "iPhone 13 Mini", 2021, 2 },
                    { new Guid("10000000-0000-0000-0000-000000000003"), "Apple", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, 1000, "iPhone 13 Pro", 2021, 3 },
                    { new Guid("10000000-0000-0000-0000-000000000004"), "Apple", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, 1000, "iPhone 13 Pro Max", 2021, 4 },
                    { new Guid("10000000-0000-0000-0000-000000000005"), "Apple", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, 1000, "iPhone 14", 2022, 5 },
                    { new Guid("10000000-0000-0000-0000-000000000006"), "Apple", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, 1000, "iPhone 14 Plus", 2022, 6 },
                    { new Guid("10000000-0000-0000-0000-000000000007"), "Apple", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, 1000, "iPhone 14 Pro", 2022, 7 },
                    { new Guid("10000000-0000-0000-0000-000000000008"), "Apple", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, 1000, "iPhone 14 Pro Max", 2022, 8 },
                    { new Guid("10000000-0000-0000-0000-000000000009"), "Apple", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, 1000, "iPhone 15", 2023, 9 },
                    { new Guid("10000000-0000-0000-0000-000000000010"), "Apple", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, 1000, "iPhone 15 Plus", 2023, 10 },
                    { new Guid("10000000-0000-0000-0000-000000000011"), "Apple", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, 1000, "iPhone 15 Pro", 2023, 11 },
                    { new Guid("10000000-0000-0000-0000-000000000012"), "Apple", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, 1000, "iPhone 15 Pro Max", 2023, 12 },
                    { new Guid("10000000-0000-0000-0000-000000000013"), "Apple", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, 1000, "iPhone 16", 2024, 13 },
                    { new Guid("10000000-0000-0000-0000-000000000014"), "Apple", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, 1000, "iPhone 16 Plus", 2024, 14 },
                    { new Guid("10000000-0000-0000-0000-000000000015"), "Apple", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, 1000, "iPhone 16 Pro", 2024, 15 },
                    { new Guid("10000000-0000-0000-0000-000000000016"), "Apple", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, 1000, "iPhone 16 Pro Max", 2024, 16 }
                });

            migrationBuilder.InsertData(
                schema: "public",
                table: "users",
                columns: new[] { "id", "created_at", "created_by", "deleted_at", "deleted_by", "email", "first_name", "is_active", "last_login_at", "last_name", "mfa_secret", "password_hash", "role", "updated_at", "updated_by" },
                values: new object[] { new Guid("00000000-0000-0000-0000-000000000001"), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, "admin@utilidades.app", "Admin", true, null, "User", null, "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCB5Qf1/tDk8QZbZK.nj2i.", 1, null, null });

            migrationBuilder.CreateIndex(
                name: "IX_apple_devices_catalog_device_id",
                schema: "public",
                table: "apple_devices",
                column: "catalog_device_id");

            migrationBuilder.CreateIndex(
                name: "ix_apple_devices_user_id",
                schema: "public",
                table: "apple_devices",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_battery_cycle_records_device_id",
                schema: "public",
                table: "battery_cycle_records",
                column: "apple_device_id");

            migrationBuilder.CreateIndex(
                name: "ix_device_catalog_name",
                schema: "public",
                table: "device_catalog",
                column: "name");

            migrationBuilder.CreateIndex(
                name: "ix_mileage_records_vehicle_date",
                schema: "public",
                table: "mileage_records",
                columns: new[] { "vehicle_id", "record_date" });

            migrationBuilder.CreateIndex(
                name: "ix_mileage_records_vehicle_id",
                schema: "public",
                table: "mileage_records",
                column: "vehicle_id");

            migrationBuilder.CreateIndex(
                name: "ix_refresh_tokens_expiry",
                schema: "public",
                table: "refresh_tokens",
                column: "expiry_date");

            migrationBuilder.CreateIndex(
                name: "ix_refresh_tokens_token",
                schema: "public",
                table: "refresh_tokens",
                column: "token");

            migrationBuilder.CreateIndex(
                name: "ix_refresh_tokens_user_id",
                schema: "public",
                table: "refresh_tokens",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_users_email",
                schema: "public",
                table: "users",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_vehicles_user_active",
                schema: "public",
                table: "vehicles",
                columns: new[] { "user_id", "is_deleted" });

            migrationBuilder.CreateIndex(
                name: "ix_vehicles_user_id",
                schema: "public",
                table: "vehicles",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "battery_cycle_records",
                schema: "public");

            migrationBuilder.DropTable(
                name: "mileage_records",
                schema: "public");

            migrationBuilder.DropTable(
                name: "refresh_tokens",
                schema: "public");

            migrationBuilder.DropTable(
                name: "apple_devices",
                schema: "public");

            migrationBuilder.DropTable(
                name: "vehicles",
                schema: "public");

            migrationBuilder.DropTable(
                name: "device_catalog",
                schema: "public");

            migrationBuilder.DropTable(
                name: "users",
                schema: "public");
        }
    }
}
