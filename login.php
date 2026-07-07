<?php
session_start();

if (isset($_SESSION['login'])) {
    header("Location: dashboard.php");
    exit;
}

$error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $username = $_POST['username'];
    $password = $_POST['password'];

    // Ganti sesuai kebutuhan
    if ($username == "admin" && $password == "admin123") {

        $_SESSION['login'] = true;
        $_SESSION['username'] = $username;

        header("Location: dashboard.php");
        exit;

    } else {

        $error = "Username atau Password salah.";

    }

}
?>

<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Login</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" rel="stylesheet">

    <style>
        body {

            background: #0f172a;

            height: 100vh;

            display: flex;

            justify-content: center;

            align-items: center;

        }

        .card {

            width: 420px;

            border-radius: 20px;

            background: #1e293b;

            color: white;

        }

        .logo {

            font-size: 60px;

            color: #6366f1;

        }
    </style>

</head>

<body>

    <div class="card shadow-lg">

        <div class="card-body p-5">

            <div class="text-center mb-4">

                <div class="logo">

                    <i class="fas fa-laptop"></i>

                </div>

                <h3 class="mt-3">IT Asset Management</h3>

                <p class="text-secondary">Sign in to continue</p>

            </div>

            <?php if ($error): ?>

                <div class="alert alert-danger">

                    <?= $error ?>

                </div>

            <?php endif; ?>

            <form method="POST">

                <div class="mb-3">

                    <label>Username</label>

                    <input type="text" name="username" class="form-control" required>

                </div>

                <div class="mb-4">

                    <label>Password</label>

                    <input type="password" name="password" class="form-control" required>

                </div>

                <button class="btn btn-primary w-100">

                    <i class="fas fa-right-to-bracket me-2"></i>

                    Login

                </button>

            </form>

        </div>

    </div>

</body>

</html>