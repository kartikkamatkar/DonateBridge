from rest_framework import serializers
from .models import NGO, NGODocument, NGOReview, Need, EmergencyCampaign, VolunteerEvent, VolunteerRegistration

class NGODocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = NGODocument
        fields = ('id', 'doc_type', 'file_url', 'uploaded_at')

class NGOReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = NGOReview
        fields = ('id', 'author_name', 'rating', 'comment', 'created_at')

class EmergencyCampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyCampaign
        fields = '__all__'

class NeedSerializer(serializers.ModelSerializer):
    ngo_name = serializers.CharField(source='ngo.name', read_only=True)
    ngo_id = serializers.IntegerField(source='ngo.id', read_only=True)
    campaign_title = serializers.CharField(source='campaign.title', read_only=True)

    class Meta:
        model = Need
        fields = (
            'id', 'ngo_id', 'ngo_name', 'category', 'item', 'quantity', 
            'fulfilled_quantity', 'urgency', 'description', 'campaign', 
            'campaign_title', 'lat', 'lng', 'created_at'
        )

class NGORegistrationSerializer(serializers.ModelSerializer):
    documents = serializers.JSONField(required=False, write_only=True)

    class Meta:
        model = NGO
        fields = (
            'name', 'lat', 'lng', 'address', 'registration_number', 
            'gov_registration_number', 'ngo_type', 'phone', 'website', 
            'state', 'district', 'city', 'pin_code', 'description', 
            'mission', 'working_areas', 'operating_since', 'volunteers_count',
            'documents'
        )

    def create(self, validated_data):
        documents_data = validated_data.pop('documents', {})
        ngo = NGO.objects.create(
            user=self.context['request'].user,
            **validated_data
        )
        
        # Save documents if provided
        for doc_key, doc_url in documents_data.items():
            NGODocument.objects.create(
                ngo=ngo,
                doc_type=doc_key,
                file_url=doc_url
            )
            
        return ngo

class NGODetailsSerializer(serializers.ModelSerializer):
    documents = serializers.SerializerMethodField()
    reviews = NGOReviewSerializer(many=True, read_only=True)
    needs = NeedSerializer(many=True, read_only=True)

    class Meta:
        model = NGO
        fields = (
            'id', 'name', 'lat', 'lng', 'address', 'registration_number', 
            'gov_registration_number', 'ngo_type', 'phone', 'website', 
            'state', 'district', 'city', 'pin_code', 'description', 
            'mission', 'working_areas', 'operating_since', 'volunteers_count',
            'verification_status', 'rejection_reason', 'trust_score', 
            'response_time', 'success_rate', 'created_at', 'updated_at', 
            'documents', 'reviews', 'needs'
        )

    def get_documents(self, obj):
        docs = obj.documents.all()
        return {doc.doc_type: doc.file_url for doc in docs}

class VolunteerEventSerializer(serializers.ModelSerializer):
    ngo_name = serializers.CharField(source='ngo.name', read_only=True)
    registered_count = serializers.SerializerMethodField()

    class Meta:
        model = VolunteerEvent
        fields = '__all__'
        read_only_fields = ('ngo',)

    def get_registered_count(self, obj):
        return obj.registrations.count()

class VolunteerRegistrationSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source='event.title', read_only=True)
    ngo_name = serializers.CharField(source='event.ngo.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = VolunteerRegistration
        fields = '__all__'
        read_only_fields = ('user',)
