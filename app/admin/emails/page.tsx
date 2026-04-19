import { getSentEmails, getAllCustomerEmails } from "@/app/actions/email";
import EmailsClient from "@/app/components/admin/emails/EmailsClient";

export default async function EmailsPage() {
  const [sentEmails, customers] = await Promise.all([
    getSentEmails(),
    getAllCustomerEmails(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Emails</h1>
        <p className="text-sm text-gray-500 mt-1">
          Send newsletters and view email history.
        </p>
      </div>
      <EmailsClient sentEmails={sentEmails} customerCount={customers.length} />
    </div>
  );
}