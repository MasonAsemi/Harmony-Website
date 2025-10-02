from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from .models import User

@csrf_exempt  # For demo purposes; use proper CSRF in production
@require_http_methods(["GET", "POST"])
def users_api(request):
    if request.method == "GET":
        # Return all users
        users = User.objects.all()
        users_list = [
            {
                'id': user.id,
                'name': user.name,
                'created_at': user.created_at.isoformat()
            }
            for user in users
        ]
        return JsonResponse({'users': users_list}, safe=False)
    
    elif request.method == "POST":
        # Create a new user
        try:
            data = json.loads(request.body)
            name = data.get('name')
            
            if not name:
                return JsonResponse({'error': 'Name is required'}, status=400)
            
            user = User.objects.create(name=name)
            return JsonResponse({
                'message': 'User created successfully',
                'user': {
                    'id': user.id,
                    'name': user.name,
                    'created_at': user.created_at.isoformat()
                }
            }, status=201)
        
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)