import museumLogo from '../assets/museum-logo.svg';
import { EXHIBITION_URL } from '../constants';

// Футер с логотипом музея. По требованию куратора логотип "Бастион"
// в общем футере не показываем — только на итоговом экране есть
// отдельное упоминание партнёра (см. ResultScreen).
export default function Footer() {
  return (
    <div className="flex items-center justify-center mt-4 xl:hidden">
      <a href={EXHIBITION_URL} target="_blank" rel="noopener noreferrer">
        <img src={museumLogo} alt="Музей криптографии — страница выставки" className="w-32 h-7" />
      </a>
    </div>
  );
}
