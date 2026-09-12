const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: September 12, 2026</p>

        <div className="space-y-8 text-gray-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Who we are</h2>
            <p>
              Omaya Care ("Omaya," "we," "us") provides a maternal and postpartum
              health support platform used by hospitals and clinics to communicate
              with mothers under their care, including over WhatsApp. This policy
              explains what information we collect through that service, how we
              use it, and the choices available to you.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Information we collect</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Your phone number and the content of messages you send us or that
                we send you over WhatsApp, including any health-related
                information you choose to share.
              </li>
              <li>
                Basic care information provided by your hospital or clinic (for
                example your name, care stage, and preferred language), used to
                personalize and route your messages appropriately.
              </li>
              <li>
                Metadata about your messages (timestamps, delivery status) needed
                to operate the service reliably.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. How we use your information</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To respond to your messages and provide postpartum care guidance.</li>
              <li>
                To flag urgent or concerning symptoms to your care team at the
                hospital or clinic where you are enrolled, so a clinician can
                follow up.
              </li>
              <li>To connect you with an expert (such as a psychologist or lactation consultant) when you request one.</li>
              <li>To improve the accuracy and safety of our service.</li>
            </ul>
            <p className="mt-2">
              We do not sell your information, and we do not use it for
              advertising.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Who we share it with</h2>
            <p>
              Your information is shared only with the clinical staff at the
              hospital or clinic where you are enrolled, and with service
              providers who help us operate the platform (such as WhatsApp/Meta,
              which processes messages on our behalf as a messaging provider, and
              our cloud hosting provider). We require these providers to protect
              your information and to use it only to provide services to us.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. WhatsApp messaging</h2>
            <p>
              Messages you exchange with us over WhatsApp are transmitted using
              Meta's WhatsApp Business Platform. Meta processes the content of
              these messages to deliver them and, as with any WhatsApp message,
              their own privacy policy also applies to that transmission. You can
              stop receiving messages from us at any time by replying "stop" or
              contacting your hospital or clinic directly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Data retention</h2>
            <p>
              We retain your information for as long as needed to provide care
              coordination and to meet our clinical record-keeping and legal
              obligations, after which it is deleted or anonymized in line with
              our data retention practices.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Your rights</h2>
            <p>
              You may ask us what information we hold about you, request a
              correction, or ask us to stop contacting you, by reaching out to
              your hospital or clinic, or by contacting us directly using the
              details below.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Contact us</h2>
            <p>
              If you have questions about this policy or how your information is
              handled, contact us at{" "}
              <a href="mailto:privacy@omayacare.com" className="text-primary underline">
                privacy@omayacare.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Changes to this policy</h2>
            <p>
              We may update this policy from time to time. We will post any
              changes on this page with a revised "last updated" date.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
