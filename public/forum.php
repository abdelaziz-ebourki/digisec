<?php
    session_start();

    // only logged in users can use the forum
    if (!isset($_SESSION['is_logged_in'])) {
        header("Location: login.php");
        exit();
    }

    // database infos
    $servername = "sql208.infinityfree.com";
    $username = "if0_37683886";
    $password = "azizearaysse1";
    $dbname = "if0_37683886_digisec_db";
    $conn = new mysqli($servername, $username, $password, $dbname);

    // handle posts
    if (isset($_POST['new_post'])) {
        $title = $_POST['title'];
        $content = $_POST['content'];
        $user_id = $_SESSION['user_id'];

        $sql = "INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("iss", $user_id, $title, $content);
        $stmt->execute();
    }

    // handle comments
    if (isset($_POST['new_comment'])) {
        $comment_text = $_POST['comment_text'];
        $post_id = $_POST['post_id'];
        $user_id = $_SESSION['user_id'];

        $sql = "INSERT INTO comments (post_id, user_id, comment_text) VALUES (?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("iis", $post_id, $user_id, $comment_text);
        $stmt->execute();
    }

    // handle post deletion
    if (isset($_POST["delete_post"])) {
        $post_id = $_POST["post_id"];

        $sql = "DELETE FROM posts WHERE id = ?";
        $delete_stmt = $conn->prepare($sql);
        $delete_stmt->bind_param("i", $post_id);

        if ($delete_stmt->execute()) {
            echo "<script>alert('Post supprimé avec succès !');</script>";
        } else {
            echo "<script>alert('Échec de la suppression du post.');</script>";
        }

        $delete_stmt->close();
        header("Location: " . $_SERVER['PHP_SELF']);
        exit();
    }

    // handle comment deletion
    if (isset($_POST["delete_comment"])) {
        $comment_id = $_POST["comment_id"];

        $sql = "DELETE FROM comments WHERE id = ?";
        $delete_stmt = $conn->prepare($sql);
        $delete_stmt->bind_param("i", $comment_id);

        if ($delete_stmt->execute()) {
            echo "<script>alert('Commentaire supprimé avec succès !');</script>";
        } else {
            echo "<script>alert('Échec de la suppression du commentaire.');</script>";
        }

        $delete_stmt->close();
        header("Location: " . $_SERVER['PHP_SELF']);
        exit();
    }

    // fetch the the posts
    $sql = "SELECT posts.*, users.first_name FROM posts JOIN users ON posts.user_id = users.id ORDER BY created_at DESC";
    $posts = $conn->query($sql);
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="css/forum.css">
    <link rel="stylesheet" href="css/header_footer.css">
    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
    <title>Forum</title>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body class="forum-page">
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
        <h1><span>DIGI</span>SEC <span>F</span>orum</h1>

        <!-- post form -->
        <div class="post-form">
            <h2>Créer un Nouveau Post</h2>
            <form method="POST">
                <label for="title"><strong>Titre du Post</strong></label>
                <input type="text" name="title" id="title" placeholder="Entrez votre titre" required>

                <label for="content"><strong>Contenu du Post</strong></label>
                <textarea name="content" id="content" rows="5" placeholder="Tapez votre post" required></textarea>

                <button type="submit" name="new_post">Publier</button>
            </form>
        </div>

        <!-- posts list -->
        <?php while ($post = $posts->fetch_assoc()): ?>
            <div class="post">
                <h3><?= htmlspecialchars($post['title']) ?></h3>
                <h4 class="author">Par <?= htmlspecialchars($post['first_name']) ?> le <?= $post['created_at'] ?></h4>
                <p><?= htmlspecialchars($post['content']) ?></p>
                <button class="toggle-comments-btn" data-post-id="<?= $post['id'] ?>">Afficher les Commentaires</button>

                <!-- delete button -->
                <?php if ($post['user_id'] == $_SESSION['user_id'] || $_SESSION["is_admin"] == 1): /* ie: only admins and post onwners can delete the post*/ ?>
                    <form method="POST" style="display: inline-block;">
                        <button type="submit" name="delete_post" class="delete-btn" onclick="return confirm('Êtes-vous sûr de vouloir supprimer ce post ?')">Supprimer le Post</button>
                        <input type="hidden" name="post_id" value="<?= $post['id'] ?>">
                    </form>
                <?php endif; ?>

                <!-- comments section -->
                <div class="comments-section" id="comments-<?= $post['id'] ?>" style="display: none;">
                    <?php
                        // fetch the comments
                        $comments_sql = "SELECT comments.*, users.first_name FROM comments JOIN users ON comments.user_id = users.id WHERE post_id = ? ORDER BY created_at DESC";
                        $comments_stmt = $conn->prepare($comments_sql);
                        $comments_stmt->bind_param("i", $post['id']);
                        $comments_stmt->execute();
                        $comments_result = $comments_stmt->get_result();
                        while ($comment = $comments_result->fetch_assoc()) {
                    ?>
                        <div class="comment">
                            <p><?= htmlspecialchars($comment['comment_text']) ?></p>
                            <small>Par <?= htmlspecialchars($comment['first_name']) ?> le <?= $comment['created_at'] ?> <br></small>

                            <!-- delete button -->
                            <?php if ($comment['user_id'] == $_SESSION['user_id'] || $_SESSION["is_admin"] == 1): /* ie: only admins and comment onwners can delete the comment*/ ?>
                                <form method="POST" style="display: inline-block;">
                                    <button type="submit" name="delete_comment" class="delete-btn" onclick="return confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')">Supprimer le Commentaire</button>
                                    <input type="hidden" name="comment_id" value="<?= $comment['id'] ?>">
                                </form>
                            <?php endif; ?>
                        </div>
                    <?php } ?>

                    <!-- add comment form -->
                    <div class="new-comment-form post-form">
                        <form method="POST">
                            <textarea name="comment_text" rows="4" placeholder="Tapez votre commentaire" required></textarea>
                            <button type="submit" name="new_comment">Poster le Commentaire</button>
                            <input type="hidden" name="post_id" value="<?= $post['id'] ?>">
                        </form>
                    </div>
                </div>
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



<script>
    $(document).on('click', '.toggle-comments-btn', function() {
        const postId = $(this).data('post-id');
        const commentsSection = $('#comments-' + postId);

        commentsSection.toggle();

        if (commentsSection.is(':visible')) {
            $(this).text('Cacher les Commentaires');
        } else {
            $(this).text('Afficher les Commentaires');
        }
    });
</script>
</body>
</html>
