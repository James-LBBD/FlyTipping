@echo off
echo Creating missing directories...
cd /d "%~dp0"

REM Create confirmation page directory
if not exist app\confirmation mkdir app\confirmation

REM Create the confirmation page file
echo Creating confirmation page...
(
echo 'use client';
echo.
echo import { useSearchParams } from 'next/navigation';
echo import Link from 'next/link';
echo import { Suspense } from 'react';
echo.
echo function ConfirmationContent^(^) {
echo   const searchParams = useSearchParams^(^);
echo   const reportId = searchParams.get^('reportId'^);
echo.
echo   return ^(
echo     ^<div className="min-h-screen bg-gray-50 flex items-center justify-center p-8"^>
echo       ^<div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8"^>
echo         ^<div className="text-center"^>
echo           ^<div className="text-6xl mb-6"^>✅^</div^>
echo           ^<h1 className="text-3xl font-bold mb-4"^>Report Submitted!^</h1^>
echo           {reportId ^&^& ^<p^>Report ID: {reportId}^</p^>}
echo           ^<Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg"^>
echo             Return Home
echo           ^</Link^>
echo         ^</div^>
echo       ^</div^>
echo     ^</div^>
echo   ^);
echo }
echo.
echo export default function ConfirmationPage^(^) {
echo   return ^<Suspense^>^<ConfirmationContent /^>^</Suspense^>;
echo }
) > app\confirmation\page.tsx

echo Done!
echo.
echo You can now use /confirmation route in the app
pause
