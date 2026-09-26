import React from 'react';
import { LetterTemplateProps } from '../../types';

export default function MinimalTemplate({ data }: LetterTemplateProps) {
  const { profile, formData } = data;
  
  const displayName = profile?.first_name || profile?.last_name
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
    : profile?.username || 'Votre Nom';

  return (
    <div className="font-serif text-gray-800 leading-relaxed text-[11pt] text-center flex flex-col h-full">
      {/* Date (Top Right) */}
      <div className="text-gray-500 text-sm mb-8 text-right italic w-full">
        {profile?.location ? `Fait à ${profile.location}, le ` : 'Fait le '} {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>

      {/* Header (Sender Info) */}
      <div className="mb-10">
        <h1 className="text-2xl tracking-widest uppercase text-gray-900 mb-4">{displayName}</h1>
        <div className="text-gray-500 text-sm flex items-center justify-center gap-3 flex-wrap">
          {profile?.contact_phone && <span>{profile.contact_phone}</span>}
          {profile?.contact_email && <span>| {profile.contact_email}</span>}
          {profile?.location && <span>| {profile.location}</span>}
        </div>
      </div>

      {/* Recipient */}
      <div className="flex flex-col items-center mb-10 text-sm">
        <div className="text-center">
          {formData.recipientName && (
            <p className="text-gray-800 mb-1">
              {formData.recipientName.toLowerCase().startsWith("à l'attention") ? formData.recipientName : `À l'attention de ${formData.recipientName}`}
            </p>
          )}
          <p className="font-bold text-gray-900">{formData.companyName}</p>
          {formData.recipientAddress && (
            <p className="text-gray-500 whitespace-pre-wrap mt-1">{formData.recipientAddress}</p>
          )}
        </div>
      </div>

      {/* Subject */}
      {formData.subject && (
        <div className="mb-8 font-bold text-gray-900 uppercase text-xs tracking-wider border-b border-gray-300 pb-2 inline-block">
          Objet : {formData.subject}
        </div>
      )}

      <div className="text-left">
        {/* Body */}
        <div className="mb-6 font-medium text-gray-900">
          {formData.salutation}
        </div>
        
        <div className="whitespace-pre-wrap mb-8 text-justify text-gray-700 leading-[2] font-sans font-light">
          {formData.body}
        </div>

        <div className="mb-12 text-gray-700 font-sans font-light">
          {formData.closing}
        </div>
      </div>

      {/* Signature */}
      <div className="text-right mt-12 font-serif">
        <p className="text-xl text-gray-900 italic">{displayName}</p>
      </div>
    </div>
  );
}
