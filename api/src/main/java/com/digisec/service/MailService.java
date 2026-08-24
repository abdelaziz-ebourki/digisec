package com.digisec.service;

import com.digisec.entity.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    private final JavaMailSender mailSender;
    private final String frontendUrl;

    public MailService(JavaMailSender mailSender,
                       @Value("${app.mail.frontend-url}") String frontendUrl) {
        this.mailSender = mailSender;
        this.frontendUrl = frontendUrl;
    }

    @Async
    public void sendVerificationEmail(User user, String rawToken) {
        String link = frontendUrl + "/verify?token=" + rawToken;
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(user.getEmail());
            helper.setSubject("DIGISEC - Vérification de votre compte");
            helper.setText(buildHtml(user.getFirstName(), link), true);
            mailSender.send(message);
        } catch (MessagingException e) {
            log.error("Failed to build verification email for {}", user.getEmail(), e);
        } catch (Exception e) {
            log.error("Failed to send verification email to {}", user.getEmail(), e);
        }
    }

    private String buildHtml(String firstName, String link) {
        return """
                <!DOCTYPE html>
                <html lang="fr">
                <body style="margin:0;padding:0;background-color:#f4f4f7;font-family:Arial,sans-serif;">
                  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:8px;overflow:hidden;">
                    <div style="background:#000000;padding:24px;text-align:center;">
                      <h1 style="color:#ffffff;margin:0;font-size:22px;">Digi<span style="color:#FFA500;">sec</span></h1>
                    </div>
                    <div style="padding:32px;">
                      <h2 style="color:#333333;margin-top:0;">Bonjour %s,</h2>
                      <p style="color:#555555;font-size:15px;line-height:1.6;">
                        Merci de votre inscription au club DIGISEC.
                        Cliquez sur le bouton ci-dessous pour vérifier votre adresse e-mail et activer votre compte :
                      </p>
                      <p style="text-align:center;margin:32px 0;">
                        <a href="%s"
                           style="background:#FFA500;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:6px;font-weight:bold;display:inline-block;">
                          Vérifier mon compte
                        </a>
                      </p>
                      <p style="color:#888888;font-size:13px;line-height:1.6;">
                        Ce lien expire dans 24 heures. Si vous n'êtes pas à l'origine de cette inscription, ignorez cet e-mail.
                      </p>
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(firstName, link);
    }
}
