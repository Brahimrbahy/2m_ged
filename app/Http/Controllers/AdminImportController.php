<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminImportController extends Controller
{
    public function import(Request $request)
    {
        $request->validate([
            'csv_file' => ['required', 'file', 'mimes:csv,txt', 'max:5120'],
        ]);

        $file = $request->file('csv_file');
        $handle = fopen($file->getRealPath(), 'r');

        if ($handle === false) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Unable to read the CSV file.']);
            return back();
        }

        $headers = fgetcsv($handle);

        if ($headers === false) {
            fclose($handle);
            Inertia::flash('toast', ['type' => 'error', 'message' => 'CSV file is empty or invalid.']);
            return back();
        }

        $headerMap = array_map('strtolower', array_map('trim', $headers));

        $created = 0;
        $skipped = 0;
        $errors = [];
        $rowNumber = 1;

        while (($row = fgetcsv($handle)) !== false) {
            $rowNumber++;

            if (count($row) < count($headerMap)) {
                $errors[] = "Row {$rowNumber}: Not enough columns.";
                $skipped++;
                continue;
            }

            $data = array_combine($headerMap, $row);

            $email = trim($data['email'] ?? '');
            $fullName = trim($data['full_name'] ?? $data['fullname'] ?? $data['name'] ?? '');
            $department = trim($data['department'] ?? '');
            $role = strtolower(trim($data['role'] ?? 'user'));

            if (empty($email) || empty($fullName)) {
                $errors[] = "Row {$rowNumber}: Missing email or full_name.";
                $skipped++;
                continue;
            }

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $errors[] = "Row {$rowNumber}: Invalid email address ({$email}).";
                $skipped++;
                continue;
            }

            if (!in_array($role, ['admin', 'manager', 'user'])) {
                $role = 'user';
            }

            if (User::where('email', $email)->exists()) {
                $errors[] = "Row {$rowNumber}: Email {$email} already exists. Skipped.";
                $skipped++;
                continue;
            }

            $password = Str::random(12);

            User::create([
                'name' => $fullName,
                'full_name' => $fullName,
                'email' => $email,
                'password' => Hash::make($password),
                'role' => $role,
                'department' => $department ?: null,
                'status' => 'active',
            ]);

            $created++;
        }

        fclose($handle);

        $message = "Import complete. {$created} users created, {$skipped} skipped.";

        \Inertia\Inertia::flash('toast', [
            'type' => $created > 0 ? 'success' : 'warning',
            'message' => $message,
        ]);

        \Inertia\Inertia::flash('importResult', [
            'success' => true,
            'created' => $created,
            'skipped' => $skipped,
            'errors' => $errors,
            'message' => $message,
        ]);

        return back();
    }
}
