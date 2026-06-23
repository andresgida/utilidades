using System;
var hash = BCrypt.Net.BCrypt.HashPassword("Admin123!", 12);
Console.WriteLine(hash);
var valid = BCrypt.Net.BCrypt.Verify("Admin123!", hash);
Console.WriteLine($"Verify: {valid}");
var originalHash = "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCB5Qf1/tDk8QZbZK.nj2i.";
var originalValid = BCrypt.Net.BCrypt.Verify("Admin123!", originalHash);
Console.WriteLine($"Original hash valid for Admin123!: {originalValid}");
