import React from 'react';
import { LetterTemplateProps } from '../../types';

export default function ModerneTemplate({ data }: LetterTemplateProps) {
  const { profile, formData } = data;
  
  const displayName = profile?.first_name || profile?.last_name
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
    : profile?.username || 'Votre Nom';

  return (
    <div className="font-sans text-gray-900 leading-relaxed text-[11pt] pl-8 border-l-4 border-indigo-600">
      {/* Date (Top Right) */}
      <div className="text-gray-500 text-sm mb-6 text-right w-full">
        {profile?.location ? `${profile.location}, le ` : 'Le '} {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>

      {/* Header (Sender Info) */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-indigo-900 mb-2 tracking-tight">{displayName}</h1>
        <div className="text-gray-600 text-sm flex items-center gap-3 flex-wrap font-medium">
          {profile?.contact_phone && <span>{profile.contact_phone}</span>}
          {profile?.contact_phone && profile?.contact_email && <span className="w-1.5 h-1.5 rounded-full bg-indigo-200" />}
          {profile?.contact_email && <span>{profile.contact_email}</span>}
          {(profile?.contact_phone || profile?.contact_email) && profile?.location && <span className="w-1.5 h-1.5 rounded-full bg-indigo-200" />}
          {profile?.location && <span>{profile.location}</span>}
        </div>
      </div>

      {/* Recipient */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="bg-gray-50 p-6 rounded-lg self-end w-2/3 border border-gray-100">
          {formData.recipientName && (
            <p className="text-gray-800 font-medium mb-1">
              {formData.recipientName.toLowerCase().startsWith("à l'attention") ? formData.recipientName : `À l'attention de ${formData.recipientName}`}
            </p>
          )}
          <p className="font-bold text-indigo-900 text-lg">{formData.companyName}</p>
          {formData.recipientAddress && (
            <p className="text-gray-600 whitespace-pre-wrap mt-2">{formData.recipientAddress}</p>
          )}
        </div>
      </div>

      {/* Subject */}
      {formData.subject && (
        <div className="mb-8 font-bold text-indigo-900 bg-indigo-50 py-3 px-4 rounded-lg inline-block">
          Objet : {formData.subject}
        </div>
      )}

      {/* Body */}
      <div className="mb-6 font-semibold text-gray-900">
        {formData.salutation}
      </div>
      
      <div className="whitespace-pre-wrap mb-8 text-gray-700 leading-loose">
        {formData.body}
      </div>

      <div className="mb-12 text-gray-700">
        {formData.closing}
      </div>

      {/* Signature */}
      <div className="text-right mt-6 pt-4 border-t border-gray-200 w-1/3 ml-auto">
        <p className="font-bold text-indigo-900 text-lg">{displayName}</p>
      </div>
    </div>
  );
}
