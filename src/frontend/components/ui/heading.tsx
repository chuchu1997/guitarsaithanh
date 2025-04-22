/** @format */

interface HeadingProps {
  title: string;
}

const HeadingComponent = (props: HeadingProps) => {
  const { title } = props;

  return (
    <h1 className="text-center text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 mb-6 leading-tight italic">
      {title}
    </h1>
  );
};

export default HeadingComponent;
