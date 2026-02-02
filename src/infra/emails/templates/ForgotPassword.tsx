import { Body } from "@react-email/body";
import { Column } from "@react-email/column";
import { Head } from "@react-email/head";
import { Heading } from "@react-email/heading";
import { Html } from "@react-email/html";
import { Row } from "@react-email/row";
import { Section } from "@react-email/section";
import { Text } from "@react-email/text";
import { TailwindConfig } from "../components/TailwindConfig";

interface IForgotPasswordProps {
  confirmationCode: string;
}

export default function ForgotPassword({
  confirmationCode,
}: IForgotPasswordProps) {
  return (
    <Html>
      <TailwindConfig>
        <Head />
        <Body>
          <Section>
            <Row>
              <Column className="text-center pt-10">
                <Heading as="h1" className="text-2xl">
                  Recover your account
                </Heading>
                <Heading as="h2" className="font-normal text-lg text-gray-700">
                  Reset your account and focus again 💪🏼
                </Heading>
              </Column>
            </Row>
            <Row>
              <Column className="text-center pt-4">
                <span className="bg-gray-200 inline-block px-8 py-4 rounded-sm text-3xl font-bold tracking-[1rem] pr-[1rem]">
                  {confirmationCode}
                </span>
              </Column>
            </Row>
            <Row>
              <Column className="text-center pt-4">
                <Text className="text-gray-700 text-base">
                  If you haven't requested this password change,
                </Text>
                <Text className="text-gray-700 text-base mt-[-8px]">
                  please disregard this message.
                </Text>
                <Text className="text-gray-700 text-base mt-[-8px]">
                  Your account is still safe!
                </Text>
              </Column>
            </Row>
          </Section>
        </Body>
      </TailwindConfig>
    </Html>
  );
}

ForgotPassword.PreviewProps = {
  confirmationCode: "476836",
};
