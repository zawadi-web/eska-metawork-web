<?php
// ============================================================
// ESKA Metalworks – Contact Form API (PHPMailer) | api/contact.php
// ============================================================

// Error reporting for debugging (disable in production)
// error_reporting(E_ALL);
// ini_set('display_errors', 1);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

require_once __DIR__ . '/../libs/PHPMailer/Exception.php';
require_once __DIR__ . '/../libs/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/../libs/PHPMailer/SMTP.php';
require_once __DIR__ . '/config.php';

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'Method Not Allowed']);
  exit;
}

// Honeypot check
if (!empty($_POST['_gotcha'])) {
  echo json_encode(['success' => true]);
  exit;
}

// Sanitize inputs
$name    = htmlspecialchars(strip_tags(trim($_POST['name'] ?? '')));
$phone   = htmlspecialchars(strip_tags(trim($_POST['phone'] ?? '')));
$email   = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$service = htmlspecialchars(strip_tags(trim($_POST['service'] ?? '')));
$message = htmlspecialchars(strip_tags(trim($_POST['message'] ?? '')));

// Validation
if (empty($name) || empty($phone) || empty($email) || empty($message)) {
  http_response_code(400);
  echo json_encode(['error' => 'All required fields must be filled out.']);
  exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo json_encode(['error' => 'Invalid email address.']);
  exit;
}

$mail = new PHPMailer(true);

try {
  // Server settings
  // $mail->SMTPDebug = SMTP::DEBUG_SERVER; // Enable for debugging
  $mail->isSMTP();
  $mail->Host       = SMTP_HOST;
  $mail->SMTPAuth   = true;
  $mail->Username   = SMTP_USER;
  $mail->Password   = SMTP_PASS;
  
  if (SMTP_ENCRYPTION === 'tls') {
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = SMTP_PORT;
  } elseif (SMTP_ENCRYPTION === 'ssl') {
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port       = SMTP_PORT;
  } else {
    $mail->SMTPAuth   = false;
    $mail->Port       = SMTP_PORT;
  }

  // Recipients
  $mail->setFrom(SMTP_USER, 'ESKA Website');
  $mail->addAddress(ADMIN_EMAIL);
  $mail->addReplyTo($email, $name);

  // Content
  $mail->isHTML(true);
  $mail->Subject = "New Quote Request: $name";
  
  $htmlBody = "<h2>New Quote Request</h2>";
  $htmlBody .= "<p><strong>Name:</strong> $name</p>";
  $htmlBody .= "<p><strong>Phone:</strong> $phone</p>";
  $htmlBody .= "<p><strong>Email:</strong> $email</p>";
  $htmlBody .= "<p><strong>Service:</strong> $service</p>";
  $htmlBody .= "<p><strong>Message:</strong><br>" . nl2br($message) . "</p>";
  
  $mail->Body    = $htmlBody;
  $mail->AltBody = "Name: $name\nPhone: $phone\nEmail: $email\nService: $service\nMessage: $message";

  $mail->send();
  $mailSent = true;
} catch (Exception $e) {
  $mailSent = false;
  // Log error if needed: $mail->ErrorInfo
}

// Local backup
$quotesFile = __DIR__ . '/../data/quotes.json';
$quotesData = [];
if (file_exists($quotesFile)) {
  $quotesData = json_decode(file_get_contents($quotesFile), true) ?: [];
}
$quotesData[] = [
  'date'    => date('Y-m-d H:i:s'),
  'name'    => $name,
  'email'   => $email,
  'phone'   => $phone,
  'service' => $service,
  'message' => $message,
  'sent_via_smtp' => $mailSent
];
file_put_contents($quotesFile, json_encode($quotesData, JSON_PRETTY_PRINT));

echo json_encode(['success' => true]);
