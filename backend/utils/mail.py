from brevo import AsyncBrevo
from brevo.transactional_emails import (
    SendTransacEmailRequestSender,
    SendTransacEmailRequestToItem,
)
from dotenv import load_dotenv
import os
import logging

load_dotenv()

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

client = AsyncBrevo(api_key=os.getenv("BREVO_API_KEY"))


class EmailService:
    async def send_email(self, to_email: str, subject: str, html_content: str) -> bool:
        try:
            result = await client.transactional_emails.send_transac_email(
                subject=subject,
                html_content=html_content,
                sender=SendTransacEmailRequestSender(
                    name="Streamify", email=os.getenv("BREVO_FROM_EMAIL")
                ),
                to=[SendTransacEmailRequestToItem(email=to_email)],
            )
            logger.info(f"Email sent successfully to {to_email}")
            return True
        except Exception as e:
            logger.error(f"Error sending email to {to_email}: {e}")
            return False
