import logging

from flask import request, session

# Configure comprehensive logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


def log_request_details():
    """Log detailed request information for debugging"""
    logger.info(f"=== REQUEST DEBUG INFO ===")
    logger.info(f"Method: {request.method}")
    logger.info(f"URL: {request.url}")
    logger.info(f"Remote Address: {request.remote_addr}")
    logger.info(f"User Agent: {request.user_agent}")
    logger.info(f"Headers: {dict(request.headers)}")
    logger.info(f"Session ID: {session.get('_id', 'No Session ID')}")
    logger.info(f"Session Contents: {dict(session)}")
    logger.info(f"Session Permanent: {session.permanent}")
    logger.info(f"Session Modified: {session.modified}")
    logger.info(f"Cookies: {dict(request.cookies)}")
    logger.info(f"=== END REQUEST DEBUG ===")


def log_session_state(operation=""):
    """Log session state for debugging"""
    logger.info(f"=== SESSION STATE {operation} ===")
    logger.info(f"Session ID: {session.get('_id', 'No Session ID')}")
    logger.info(f"Session Contents: {dict(session)}")
    logger.info(f"Session Permanent: {session.permanent}")
    logger.info(f"Session Modified: {session.modified}")
    logger.info(f"User Email: {session.get('user_email', 'NOT FOUND')}")
    logger.info(f"=== END SESSION STATE ===")

