<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: Arial, sans-serif;
        }

        body {
            background: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            color: #333;
        }

        .login-container {
            background: #ffffff;
            width: 100%;
            max-width: 400px;
            padding: 2em;
            border-radius: 8px;
            box-shadow: 0 0 8px #d78c01;
            text-align: center;
        }

        .login-container h1 {
            font-size: 2em;
            margin-bottom: 1em;
            color: #333;
        }

        span {
            color: #FFA500;
        }

        .login-container a {
            display: block;
            background-color: white;
            color: #FFA500;
            padding: 12px 25px;
            border: 2px solid #FFA500;
            border-radius: 6px 32px;
            box-shadow: 10px -8px #d78c01;
            font-size: 18px;
            font-weight: bold;
            transition: 0.8s;
            text-decoration: none;
            width: 50%;
            margin: 1em auto 0;
            cursor: pointer;
        }

        .login-container a:hover {
            background-color: #df9201;
            color: #2f3e46;
        }

        .login-container p {
            font-size: 1em;
            color: #666;
            margin: 1em 0;
        }

        .login-container {
            animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    </style>
</head>
<body>
    <div class="login-container">
        <?php
            // database infos
            $servername = "sql208.infinityfree.com";
            $username = "if0_37683886";
            $password = "azizearaysse1";
            $dbname = "if0_37683886_digisec_db";
            $conn = new mysqli($servername, $username, $password, $dbname);

            // getting the email and the token
            if (isset($_GET['email']) && isset($_GET['token'])) {
                $email = $_GET['email'];
                $token = $_GET['token'];

                $sql = "SELECT * FROM users WHERE email = ? AND token = ? AND verified = 0";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("ss", $email, $token);
                $stmt->execute();
                $result = $stmt->get_result();

                if ($result->num_rows > 0 /* ie: one or more email has been found*/ ) {
                    $update_sql = "UPDATE users SET verified = 1, token = NULL WHERE email = ?";
                    $update_stmt = $conn->prepare($update_sql);
                    $update_stmt->bind_param("s", $email);
                    
                    if ($update_stmt->execute()) {
                        echo '<h1><span>V</span>érification</span> Complète!</h1>';
                        echo '<p>Votre email a été vérifié avec succès. Vous pouvez maintenant vous connecter.</p>';
                        echo '<a href="login.php">Se connecter</a>';
                    } else {
                        echo '<h1>Erreur</h1>';
                        echo '<p>Une erreur est survenue lors de la vérification de votre compte. Veuillez réessayer plus tard.</p>';
                    }
                } else {
                    echo '<h1>Token Invalide ou Expiré</h1>';
                    echo '<p>Le lien de vérification est soit invalide, soit déjà utilisé. Veuillez demander un nouvel email de vérification.</p>';
                }
            } else {
                echo '<h1>Erreur</h1>';
                echo '<p>Demande invalide. Veuillez vérifier votre lien de vérification.</p>';
            }
        ?>
    </div>
</body>
</html>
