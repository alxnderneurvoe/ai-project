<?php
$appsDir = __DIR__ . '/apps';
$files = [];

if (is_dir($appsDir)) {
    $items = scandir($appsDir);
    foreach ($items as $item) {
        if ($item === '.' || $item === '..')
            continue;
        $fullPath = $appsDir . '/' . $item;
        if (is_file($fullPath)) {
            $files[] = [
                'name' => $item,
                'size' => filesize($fullPath),
                'modified' => filemtime($fullPath),
            ];
        }
    }
}

function formatBytes($bytes)
{
    if ($bytes >= 1073741824)
        return round($bytes / 1073741824, 2) . ' GB';
    if ($bytes >= 1048576)
        return round($bytes / 1048576, 2) . ' MB';
    if ($bytes >= 1024)
        return round($bytes / 1024, 2) . ' KB';
    return $bytes . ' B';
}

function iconForFile($filename)
{
    $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    $map = [
        'exe' => 'fa-windows',
        'msi' => 'fa-windows',
        'dmg' => 'fa-apple',
        'pkg' => 'fa-apple',
        'zip' => 'fa-file-zipper',
        'rar' => 'fa-file-zipper',
        'deb' => 'fa-linux',
    ];
    return $map[$ext] ?? 'fa-file-arrow-down';
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Download Apps - IT Asset Management</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
        rel="stylesheet">
    <link rel="stylesheet" href="assets/style_common.css">
    <link rel="stylesheet" href="assets/style_login.css">
</head>

<body class="login-page">
    <div class="login-container">
        <div class="login-card" style="max-width: 520px;">
            <div class="login-header">
                <h1><i class="fas fa-cloud-arrow-down"></i> Download Apps</h1>
                <p>Installer untuk setup device baru</p>
            </div>
            <div class="login-body">
                <?php if (empty($files)): ?>
                    <div class="alert login-alert alert-warning" role="alert">
                        <i class="fas fa-triangle-exclamation"></i>
                        <span>Belum ada file di folder apps/</span>
                    </div>
                <?php else: ?>
                    <div class="list-group mb-3">
                        <?php foreach ($files as $file): ?>
                            <a href="apps/<?= rawurlencode($file['name']) ?>" download
                                class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                <span>
                                    <i class="fas <?= iconForFile($file['name']) ?> me-2"></i>
                                    <?= htmlspecialchars($file['name']) ?>
                                </span>
                                <small class="text-muted"><?= formatBytes($file['size']) ?></small>
                            </a>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>

                <a href="login.php" class="btn btn-login w-100">
                    <i class="fas fa-arrow-left"></i>
                    Kembali ke Login
                </a>
            </div>
        </div>
    </div>
</body>

</html>