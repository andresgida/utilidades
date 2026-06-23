using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Utilidades.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAdminPasswordHash : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                schema: "public",
                table: "users",
                keyColumn: "id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"),
                column: "password_hash",
                value: "$2a$12$vAcchaJ/XYYwoJLEo2pUseS.8g/iBsz7M35d3XO49EvExahb0UMe2");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                schema: "public",
                table: "users",
                keyColumn: "id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"),
                column: "password_hash",
                value: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCB5Qf1/tDk8QZbZK.nj2i.");
        }
    }
}
