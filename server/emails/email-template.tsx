import * as React from "react";

interface EmailTemplateProps {
  code: string;
}

export function EmailTemplate({ code }: EmailTemplateProps) {
  return (
    <div>
      <h1>Verification Code:</h1>
      <p>{code}</p>
      <p>This verificaton code will expire in 10 minutes if unused.</p>
    </div>
  );
}
