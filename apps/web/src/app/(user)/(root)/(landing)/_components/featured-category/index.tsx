import HorizontalScroll from '@/components/horizontal-scroll';

type Props = {};

export default function PopularCategory({}: Props) {
  // const s:

  return (
    <div className="mt-12">
      <h2 className="text-neutral-700 text-lg font-semibold">
        Popular Category
      </h2>

      <HorizontalScroll>
        {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((item, idx) => (
          <div key={idx} className="bg-red-400 px-3 mx-3 w-[200px] h-[200px]">
            <div>{item}</div>
          </div>
        ))}
      </HorizontalScroll>
    </div>
  );
}
