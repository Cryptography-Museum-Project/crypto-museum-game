interface ScenarioVisualImageProps {
  src: string;
  alt: string;
}

export default function ScenarioVisualImage({ src, alt }: ScenarioVisualImageProps) {
  return (
    <div className="w-full flex items-center justify-center">
      <img
        src={src}
        alt={alt}
        className="w-full max-w-[230px] h-auto select-none"
        draggable={false}
      />
    </div>
  );
}
