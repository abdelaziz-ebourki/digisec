<?php
session_start();

// database infos
$servername = "sql208.infinityfree.com";
$username = "if0_37683886";
$dbpassword = "azizearaysse1";
$dbname = "if0_37683886_digisec_db";
$conn = new mysqli($servername, $username, $dbpassword, $dbname);

if ($conn->connect_error) {
    die("Échec de la connexion : " . $conn->connect_error);
}


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // get the form data
    $email = $_POST['email'];
    $password = $_POST['password'];

    // fetch the user
    $sql = "SELECT id, password, verified, is_admin FROM users WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0 /* ie: a user hase been found */) {
        // get the user data
        $user = $result->fetch_assoc();
                
        // verify the password
        if (password_verify($password, $user['password']) && $user['verified'] == 1) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['is_logged_in'] = true;
            $_SESSION['is_admin'] = $user['is_admin'];
            header("Location: forum.php");
            exit();
        } else {
            $error_message = "Mot de passe incorrect.";
        }
    } else {
        $error_message = "Aucun utilisateur trouvé avec cette adresse email.";
    }
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="css/login.css">
    <title>Connexion</title>

</head>
<body>

    <div class="login-container">
        <h1><span>C</span>onnexion</h1>
        <form action="login.php" method="POST" class="login-form">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" placeholder="Entrez votre email" required>

            <label for="password">Mot de Passe</label>
            <input type="password" id="password" name="password" placeholder="Entrez votre mot de passe" required>

            <button type="submit">Se Connecter</button>

            <a href="register.php" class="link">Vous n'avez pas de compte ? Inscrivez-vous</a>
            <?php
                if (isset($error_message)) {
                    echo '<p>' . $error_message . '</p>';
                }
            ?>
        </form>
    </div>
</body>
</html>
