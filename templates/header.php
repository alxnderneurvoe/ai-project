<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Device Handover System</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
        rel="stylesheet">
    <!-- FontAwesome for Premium Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="icon"
        href="https://www.caliana.id/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FCalianaLogoOnly.04c7317d.png&w=1200&q=90">
    
    <!-- Common Styles (All Pages) -->
    <link rel="stylesheet" href="assets/style_common.css">
    
    <!-- Page-Specific Styles -->
    <?php
        $current_page = basename($_SERVER['PHP_SELF']);
        $page_styles = [
            'dashboard.php' => 'style_dashboard.css',
            'handover.php' => 'style_handover.css',
            'history.php' => 'style_history.css',
            'add-device.php' => 'style_add-device.css',
            'login.php' => 'style_login.css',
        ];
        
        if (isset($page_styles[$current_page])) {
            echo '<link rel="stylesheet" href="assets/' . $page_styles[$current_page] . '">';
        }
    ?>
</head>

<body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container">
            <a class="navbar-brand" href="dashboard.php">
                IT Asset Management
            </a>
            <button class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#menu">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="menu">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="dashboard.php">
                            Dashboard
                        </a>
                    </li>
                                        <?php if (current_user_role() === 'admin'): ?>
                        <li class="nav-item">
                            <a class="nav-link" href="add-device.php">
                                Add Device
                            </a>
                        </li>
                                        <?php endif; ?>
                                        <?php if (current_user_role() !== 'viewer'): ?>
                        <li class="nav-item">
                            <a class="nav-link" href="handover.php">
                                Handover
                            </a>
                        </li>
                                        <?php endif; ?>
                    <li class="nav-item">
                        <a class="nav-link" href="history.php">
                            History
                        </a>
                    </li>
                    <a href="logout.php" class="btn btn-outline-danger">
                        <i class="fas fa-sign-out-alt"></i>
                        Logout
                    </a>
                </ul>
            </div>
        </div>
    </nav>
    <div class="container mt-4">