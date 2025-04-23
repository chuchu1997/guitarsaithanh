/** @format */

import HeadingComponent from "@/components/ui/heading";
import { ChromeProfileForm } from "../components/chrome-form";

const ChromeCreateView = () => {
  return (
    <>
      <HeadingComponent title="Tạo Profile Chrome Mới" />
      <ChromeProfileForm initialData={null} />
    </>
  );
};

export default ChromeCreateView;
