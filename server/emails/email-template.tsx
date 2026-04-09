import * as React from "react";

interface EmailTemplateProps {
  code: string;
}

export function EmailTemplate({ code }: EmailTemplateProps) {
  return (
    <div>
      <h4>Verification Code:</h4>
      <p>{code}</p>
      <p>This verificaton code will expire in 10 minutes if unused.</p>
    </div>
  );
}
