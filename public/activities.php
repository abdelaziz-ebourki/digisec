<?php
session_start();

// database infos
$servername = "sql208.infinityfree.com";
$username = "if0_37683886";
$password = "azizearaysse1";
$dbname = "if0_37683886_digisec_db";
$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// handle activity insertion
if (isset($_POST["add_activity"])) {
    $title = $_POST['activity_title'];
    $activity_date = $_POST['activity_date'];
    $message = $_POST['activity_message'];
    $image_data = null;
    $image_type = null;

    // handle image upload
    if (isset($_FILES['activity_image']) && $_FILES['activity_image']['error'] == 0) {
        $image_type = mime_content_type($_FILES['activity_image']['tmp_name']);
        $allowed_types = ['image/jpeg', 'image/png', 'image/gif'];

        if (in_array($image_type, $allowed_types)) {
            $image_data = file_get_contents($_FILES['activity_image']['tmp_name']);
        } else {
            die("<script>alert('Invalid image format. Only JPG, JPEG, PNG, and GIF are allowed.');</script>");
        }
    }

    $sql = "INSERT INTO activities (title, activity_date, message, image_data, image_type) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        die("Prepare failed: " . $conn->error);
    }

    $stmt->bind_param("sssss", $title, $activity_date, $message, $image_data, $image_type);
    $stmt->send_long_data(3, $image_data);

    if ($stmt->execute()) {
        echo "<script>alert('Activité ajoutée avec succès!');</script>";
    } else {
        echo "<script>alert('Error: " . $stmt->error . "');</script>";
    }
}

// handle activity deletion
if (isset($_POST["delete_activity_id"])) {
    $delete_id = intval($_POST["delete_activity_id"]);

    $sql = "DELETE FROM activities WHERE id = ?";
    $stmt = $conn->prepare($sql);    
    $stmt->bind_param("i", $delete_id);
    
    if ($stmt->execute()) {
        echo "<script>alert('Activité supprimée avec succès!');</script>";
        echo "<script>window.location.href='activities.php';</script>";
    } else {
        echo "<script>alert('Error: " . $stmt->error . "');</script>";
    }
}

// fetch all the activities 
$sql = "SELECT id, title, activity_date AS date, message, image_data FROM activities ORDER BY activity_date DESC";
$activities = $conn->query($sql);
if (!$activities) {
    die("Error fetching activities: " . $conn->error);
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Activité Récente</title>
    <link rel="stylesheet" href="css/activities.css">
    <link rel="stylesheet" href="css/header_footer.css">
    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
</head>
<body>
    <header>
        <nav aria-label="Main menu" class="nav-menu">
            <ul>
                <li><a href="page-index1.html">⟰ ACCUEIL</a></li>
                <li><a href="digisec1.html">DIGISEC</a></li>
                <li><a href="activities.php">ACTIVITÉS</a></li>
                <li><a href="forum.php">FORUM DE DISCUSSION</a></li>
                <li><a href="register.php">ADHÉSION</a></li>
            </ul>
        </nav>
    </header>

    <div class="container">
        <div class="header">
            <h1><span>A</span>ctivité <span>R</span>écente</h1>
        </div>
        <div id="activity-list"></div>
    </div>

    <?php if(isset($_SESSION["is_admin"]) && $_SESSION["is_admin"] == 1): /*only admins can see the adding form */ ?>
        <div id="add-form">
            <h2 id="form-title">Nouvelle Activité</h2>
            <form action="activities.php" method="POST" id="activity-form" enctype="multipart/form-data">
                <label for="activity_title">Titre :</label>
                <input type="text" id="activity-title" name="activity_title" required>

                <label for="activity_date">Date :</label>
                <input type="date" id="activity-date" name="activity_date" required>

                <label for="activity_message">Message :</label>
                <textarea id="activity_message" name="activity_message" required></textarea>

                <label for="activity_image">Image :</label>
                <input type="file" id="activity-image" name="activity_image" required accept="image/*">

                <button type="submit" name="add_activity">Sauvegarder</button>
            </form>
        </div>
    <?php endif ?>

    <!-- Activity List -->
        <div class="container activity activity-item">
            <?php while ($activity = $activities->fetch_assoc()): ?>
                <div class="activity-item">
                    <h2><?= htmlspecialchars($activity['title']) ?></h2>
                    <p><strong>Date:</strong> <?= htmlspecialchars($activity['date']) ?></p>
                    <p><?= nl2br(htmlspecialchars($activity['message'])) ?></p>
                    <img src="data:<?= htmlspecialchars($activity['image_type']) ?>;base64,<?= base64_encode($activity['image_data']) ?>" 
                        alt="Activity Image" class="activity-image">
                    <?php if (isset($_SESSION["is_admin"]) && $_SESSION["is_admin"] == 1): /* only admins can see the deletion button */?>
                        <form action="activities.php" method="POST" class="delete-form">
                            <input type="hidden" name="delete_activity_id" value="<?= $activity['id'] ?>">
                            <button type="submit" class="delete-btn">Supprimer</button>
                        </form>
                    <?php endif; ?>
                </div>
            <?php endwhile; ?>
        </div>

    <footer>
        <div class="footer-content">
            <div class="footer-section">
                <ul class="contact-list">
                    <li><i class="bx bxs-been-here"></i> Digisec FSBM, Casablanca - 20670</li>
                    <li><a href="mailto:digisecfsbm@gmail.com"><i class="bx bxs-envelope"></i> digisecfsbm@gmail.com</a></li>
                    <li><a href="tel:+212668889041"><i class="bx bxs-phone"></i> +212 668-889041</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h3>Restez connectés</h3>
                <div class="social-icons">
                    <a href="https://www.facebook.com" target="_blank"><i class="bx bxl-facebook"></i></a>
                    <a href="https://twitter.com" target="_blank"><i class="bx bxl-twitter"></i></a>
                    <a href="https://www.linkedin.com" target="_blank"><i class="bx bxl-linkedin-square"></i></a>
                    <a href="https://www.instagram.com" target="_blank"><i class="bx bxl-instagram"></i></a>
                </div>
                <p>&copy; 2024 DIGISEC. TOUS LES DROITS RÉSERVÉS</p>
            </div>
        </div>
    </footer>
</body>
</html>

