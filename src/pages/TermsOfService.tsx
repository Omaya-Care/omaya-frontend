const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: September 12, 2026</p>

        <div className="space-y-8 text-gray-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Acceptance of these terms</h2>
            <p>
              By using Omaya Care's WhatsApp service ("the Service"), including
              completing our onboarding form or exchanging messages with our
              assistant, you agree to these Terms of Service and to our{" "}
              <a href="/privacy" className="text-primary underline">
                Privacy Policy
              </a>
              . If you do not agree, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. What the Service is</h2>
            <p>
              Omaya Care provides regular check-ins, information, and a way to
              flag concerns to your care team during pregnancy and after birth,
              delivered over WhatsApp. The Service may be offered to you either
              because a hospital or clinic enrolled you, or because you signed up
              directly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. This is not emergency care</h2>
            <p>
              The Service does not replace professional medical advice, diagnosis,
              or treatment, and it is not an emergency service. If you or your baby
              may be experiencing a medical emergency, go to the nearest hospital
              or clinic, or call your local emergency number immediately — do not
              wait for a reply from us.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Your responsibilities</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Provide accurate information when asked (for example your stage, dates, and location).</li>
              <li>Use the number registered to you, so we can correctly identify you.</li>
              <li>
                Tell us, or your hospital/clinic, right away if something about
                your care changes or if you no longer wish to receive messages.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. WhatsApp messaging</h2>
            <p>
              The Service is delivered using Meta's WhatsApp Business Platform, and
              your use of WhatsApp is also subject to WhatsApp's own terms. You can
              stop receiving messages from us at any time by replying "stop," or by
              contacting your hospital or clinic directly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Availability</h2>
            <p>
              We aim to keep the Service available and responsive, but we do not
              guarantee uninterrupted access — messages can be delayed or lost due
              to network, WhatsApp, or other factors outside our control. Please
              do not rely on the Service as your only way to reach help.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Changes and ending the Service</h2>
            <p>
              You may stop using the Service at any time. We may suspend or end
              the Service, or update these terms, at any time; we will post any
              material changes on this page with a revised "last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Contact us</h2>
            <p>
              If you have questions about these terms, contact us at{" "}
              <a href="mailto:hello@omayacare.com" className="text-primary underline">
                hello@omayacare.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
