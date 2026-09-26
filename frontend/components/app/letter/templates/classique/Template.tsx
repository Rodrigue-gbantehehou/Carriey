import React from 'react';
import { LetterTemplateProps } from '../../types';

export default function ClassiqueTemplate({ data }: LetterTemplateProps) {
  const { profile, formData } = data;
  
  const displayName = profile?.first_name || profile?.last_name
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
    : profile?.username || 'Votre Nom';

  return (
    <div className="font-sans text-gray-900 leading-relaxed text-[11pt]">
      {/* Date (Top Right) */}
      <div className="text-gray-900 text-sm mb-6 text-right">
        {profile?.location ? `${profile.location}, le ` : 'Le '} {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>

      {/* Header (Sender Info) */}
      <div className="mb-10 border-b border-gray-300 pb-5">
        <h1 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">{displayName}</h1>
        <div className="text-gray-600 text-sm flex items-center gap-3 flex-wrap">
          {profile?.contact_phone && <span>{profile.contact_phone}</span>}
          {profile?.contact_phone && profile?.contact_email && <span>•</span>}
          {profile?.contact_email && <span>{profile.contact_email}</span>}
          {(profile?.contact_phone || profile?.contact_email) && profile?.location && <span>•</span>}
          {profile?.location && <span>{profile.location}</span>}
        </div>
      </div>

      {/* Recipient & Date */}
      <div className="flex flex-col items-end mb-8">
        <div className="w-1/2 text-left mb-6">
          {formData.recipientName && (
            <p className="text-gray-800 font-medium mb-1">
              {formData.recipientName.toLowerCase().startsWith("à l'attention") ? formData.recipientName : `À l'attention de ${formData.recipientName}`}
            </p>
          )}
          <p className="font-bold text-gray-900 text-lg">{formData.companyName}</p>
          {formData.recipientAddress && (
            <p className="text-gray-600 whitespace-pre-wrap mt-1">{formData.recipientAddress}</p>
          )}
        </div>
      </div>

      {/* Subject */}
      {formData.subject && (
        <div className="mb-8 font-bold text-gray-900">
          Objet : {formData.subject}
        </div>
      )}

      {/* Body */}
      <div className="mb-6 font-medium text-gray-900">
        {formData.salutation}
      </div>
      
      <div className="whitespace-pre-wrap mb-8 text-justify text-gray-700 leading-[1.8]">
        {formData.body}
      </div>

      <div className="mb-12 text-gray-700">
        {formData.closing}
      </div>

      {/* Signature */}
      <div className="text-right ">
        <p className="text-gray-500 text-sm mb-2">Cordialement,</p>
        <p className="font-bold text-gray-900 text-lg">{displayName}</p>
      </div>
    </div>
  );
}
