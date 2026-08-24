<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="css/register.css">
    <link rel="stylesheet" href="css/header_footer.css">
    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
    <title>Inscription</title>

    <script>
        function closePopup(){
            const popupBackgrounds = document.querySelectorAll('.popup_background');
            popupBackgrounds.forEach(popup => popup.style.display = 'none');
        }
    </script>
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
        <h1><span>Re</span>joignez notre <span>communauté</span></h1>
        <form action="register.php" method="POST" id="registration_form">
            <label for="first_name">Prénom</label>
            <input type="text" id="first_name" name="first_name" pattern="[A-Za-z\s]+" placeholder="Prénom" required>

            <label for="last_name">Nom</label>
            <input type="text" id="last_name" name="last_name" pattern="[A-Za-z\s]+" placeholder="Nom" required>

            <label for="code_apoge">Code Apogée</label>
            <input type="text" id="code_apoge" name="code_apoge" pattern="\d{8}" placeholder="8 chiffres" required>

            <label for="email">Email</label>
            <input type="email" id="email" name="email" placeholder="ex: exemple@domaine.com" required>

            <label for="phone_number">Numéro de téléphone</label>
            <input type="tel" id="phone_number" name="phone_number"  pattern="\d{10}" placeholder="10 chiffres" required>

            <label for="password">Mot de passe</label>
            <input type="password" id="password" name="password" minlength="8" placeholder="Au moins 8 caractères" required>

            <button type="submit" name="submit">S'inscrire</button>
            <a href="login.php" class="link">Vous avez déjà un compte? Connectez-vous</a>
        </form>
    </div>

    <?php
    if (isset($_POST['submit'])) {
        // include the phpmailer libraries
        require '../PHPMailer/PHPMailer.php';
        require '../PHPMailer/SMTP.php';
        require '../PHPMailer/Exception.php';

        // get form data
        $first_name = $_POST["first_name"];
        $last_name = $_POST["last_name"];
        $code_apoge = $_POST["code_apoge"];
        $email = $_POST["email"];
        $phone_number = $_POST["phone_number"];
        $password = $_POST["password"];

        // database info
        $servername = "sql208.infinityfree.com";
        $username = "if0_37683886";
        $dbpassword = "azizearaysse1";
        $dbname = "if0_37683886_digisec_db";
        $conn = new mysqli($servername, $username, $dbpassword, $dbname);

        // create a token and verification link
        $token = bin2hex(random_bytes(32));  
        $verification_link = "http://digisec.rf.gd/public/verify.php?email=$email&token=$token";

        // Create a new PHPMailer instance
        $mail = new PHPMailer\PHPMailer\PHPMailer();

        // fetch if exist the email, phone number, and code apoge
        $sql = "SELECT * FROM users WHERE code_apoge = ? OR phone_number = ? OR email = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sss", $code_apoge, $phone_number, $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0 /* ie: a user hase been found */) {
            while ($row = $result->fetch_assoc()) {
                if ($row['code_apoge'] == $code_apoge) {
                    echo '
                    <div class="popup_background" id="error_apoge">
                        <div class="popup">
                            <button class="close-btn" onclick="closePopup()">X</button>
                            <h2>Le code Apogée est déjà utilisé.</h2>
                            <p>Veuillez entrer un autre code Apogée, ou essayez de vous connecter.</p>
                            <a href="login.php" id="login">Se Connecter</a>
                        </div>
                    </div>';
                    break;
                }
                if ($row['phone_number'] == $phone_number) {
                    echo '
                    <div class="popup_background" id="error_phone">
                        <div class="popup">
                            <button class="close-btn" onclick="closePopup()">X</button>
                            <h2>Le numéro de téléphone est déjà utilisé.</h2>
                            <p>Veuillez entrer un autre numéro de téléphone, ou essayez de vous connecter.</p>
                            <a href="login.php" id="login">Se Connecter</a>
                        </div>
                    </div>';
                    break;
                }
                if ($row['email'] == $email) {
                    echo '
                    <div class="popup_background" id="error_email">
                        <div class="popup">
                            <button class="close-btn" onclick="closePopup()">X</button>
                            <h2>L\'email est déjà utilisé.</h2>
                            <p>Veuillez entrer un autre email, ou essayez de vous connecter.</p>
                            <a href="login.php" id="login">Se Connecter</a>
                        </div>
                    </div>';
                    break;
                }
            }
        }
        else{
            try {
                // Server settings
                $mail->isSMTP();
                $mail->Host = 'smtp-relay.brevo.com';
                $mail->SMTPAuth = true;
                $mail->Username = '7fbde4002@smtp-brevo.com';
                $mail->Password = 'qG6xnWXdytL2ZzMm';
                $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
                $mail->Port = 587;

                // Recipients
                $mail->setFrom('ebourki.azize@gmail.com', 'digisec.rf.gd');
                $mail->addAddress($email, $first_name);

                // Content
                $mail->isHTML(true);
                $mail->Subject = 'Verify Your Email Address';
                $mail->Body = file_get_contents('verification_email_template.html');
                $mail->Body = str_replace('{{verification_link}}', $verification_link, $mail->Body);
                $mail->Body = str_replace('{{first_name}}', $first_name, $mail->Body);

                // Send the email
                if ($mail->send() /* ie: mail hase been sent successfully */) {
                        // add the user to the database
                        $hashed_password = password_hash($password, PASSWORD_BCRYPT);
                        $sql = "INSERT INTO users (first_name, last_name, code_apoge, email, phone_number, password, token) VALUES (?, ?, ?, ?, ?, ?, ?)";
                        $stmt = $conn->prepare($sql);
                        $stmt->bind_param("sssssss", $first_name, $last_name, $code_apoge, $email, $phone_number, $hashed_password, $token);  
                        $stmt->execute();

                        // success popup
                        echo '
                        <div class="popup_background" id="success_message">
                            <div class="popup">
                                <button class="close-btn" onclick="closePopup()">X</button>
                                <h2><span>V</span>erification de l\'email envoyée avec <span>succès</span>!</h2>
                                <p>Veuillez vérifier votre boîte mail et confirmer votre adresse email.<br>Vous pouvez fermer cette page.</p>
                            </div>
                        </div>';
                    } else {
                        // mailer error popup
                        echo '
                        <div class="popup_background" id="error_mailer">
                            <div class="popup">
                                <button class="close-btn" onclick="closePopup()">X</button>
                                <h2>Erreur d\'envoi du mail</h2>
                                <p>Il y a eu un problème lors de l\'envoi de l\'email.</p>
                                <p>Erreur : ' . htmlspecialchars($mail->ErrorInfo) . '</p>
                            </div>
                        </div>';
                    }
                } catch (Exception $e) {
                    // exception error popup
                    echo '
                    <div class="popup_background" id="exception">
                        <div class="popup">
                            <button class="close-btn" onclick="closePopup()">X</button>
                            <h2>Le message n\'a pas pu être envoyé</h2>
                            <p>Vérifiez votre connexion et réessayez.</p>
                            <p>Erreur : ' . htmlspecialchars($mail->ErrorInfo) . '</p>
                        </div>
                    </div>';
                }
        }
    }
    ?>

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
