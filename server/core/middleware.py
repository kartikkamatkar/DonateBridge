import urllib.parse
# pyrefly: ignore [missing-import]
from django.conf import settings
# pyrefly: ignore [missing-import]
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async
# pyrefly: ignore [missing-import]
from rest_framework_simplejwt.tokens import AccessToken
# pyrefly: ignore [missing-import]
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
# pyrefly: ignore [missing-import]
from django.contrib.auth.models import AnonymousUser

User = get_user_model()

@database_sync_to_async
def get_user_from_token(token_key):
    try:
        access_token = AccessToken(token_key)
        user_id = access_token[settings.SIMPLE_JWT['USER_ID_CLAIM']]
        user = User.objects.get(id=user_id)
        return user
    except (InvalidToken, TokenError, User.DoesNotExist, KeyError):
        return AnonymousUser()

class JWTAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode("utf-8")
        query_params = urllib.parse.parse_qs(query_string)
        token_key = query_params.get("token", [None])[0]

        if token_key:
            scope["user"] = await get_user_from_token(token_key)
        else:
            scope["user"] = AnonymousUser()

        return await self.inner(scope, receive, send)
