export interface LetterData {
  profile: any;
  formData: {
    title: string;
    recipientName: string;
    companyName: string;
    recipientAddress: string;
    subject: string;
    salutation: string;
    body: string;
    closing: string;
  };
}

export interface LetterTemplateProps {
  data: LetterData;
}
