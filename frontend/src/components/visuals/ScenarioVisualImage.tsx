interface ScenarioVisualImageProps {
  src: string;
  alt: string;
}

// Общий компонент для готовых PNG-иллюстраций сценариев (телефон/сайт/звонок
// и т.д.), которые дизайнер отдал уже отрисованными целиком — в отличие от
// старых визуалов, здесь не нужна дополнительная белая карточка-подложка,
// изображение уже самодостаточно и ложится прямо на фон экрана.
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
