import React, { useState } from 'react';
import { X, Search, MapPin, Plus } from 'lucide-react';

interface KakaoPlace {
  id: string;
  place_name: string;
  category_name: string;
  address_name: string;
  road_address_name: string;
  x: string; // longitude
  y: string; // latitude
}

interface PlaceSearchModalProps {
  onClose: () => void;
  // 💡 onSelect가 KakaoPlace와 함께 boolean 값을 받도록 수정
  onSelect: (place: KakaoPlace, isAccommodation: boolean) => void;
}

const PlaceSearchModal: React.FC<PlaceSearchModalProps> = ({ onClose, onSelect }) => {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<KakaoPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  // 💡 숙소 등록 상태 추가
  const [isAccommodation, setIsAccommodation] = useState(false);

  const handleSearch = (): void => {
    if (!keyword.trim()) return;
    setIsSearching(true);
    setSearched(true);

    const ps = new (window as any).kakao.maps.services.Places();

    ps.keywordSearch(keyword, (result: any[], status: any) => {
      setIsSearching(false);
      if (status === (window as any).kakao.maps.services.Status.OK) {
        const formattedResults: KakaoPlace[] = result.map((item) => ({
          id: item.id,
          place_name: item.place_name,
          category_name: item.category_name,
          address_name: item.address_name,
          road_address_name: item.road_address_name,
          x: item.x,
          y: item.y,
        }));
        setResults(formattedResults);
      } else {
        setResults([]);
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-[480px] shadow-xl overflow-hidden">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e9ecef]">
          <span className="text-[15px] font-medium">장소 검색</span>
          <button onClick={onClose} className="text-[#adb5bd] hover:text-[#6c757d] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 검색 입력 */}
        <div className="px-5 py-4 border-b border-[#e9ecef]">
          <div className="flex gap-2">
            <input
              className="flex-1 py-2 px-3 border border-[#dee2e6] rounded-md text-sm focus:outline-none focus:border-[#178DD7] transition-colors"
              type="text"
              placeholder="장소명을 입력하세요 (예: 성산일출봉)"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-[#178DD7] text-white rounded-md text-sm hover:bg-[#1278ba] transition-colors flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              검색
            </button>
          </div>
        </div>

        {/* 검색 결과 */}
        <div className="max-h-[360px] overflow-y-auto">
          {/* ... (로딩/결과없음 상태는 기존 유지) ... */}
          {isSearching && (
            <div className="flex items-center justify-center py-10 text-[13px] text-[#6c757d]">
              <div className="animate-spin w-4 h-4 mr-2 border-2 border-[#178DD7] border-t-transparent rounded-full" />
              검색 중...
            </div>
          )}
          {!isSearching && searched && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-[13px] text-[#adb5bd]">
              <Search className="w-8 h-8 mb-2 opacity-30" />
              검색 결과가 없어요
            </div>
          )}

          {!isSearching && results.length > 0 && (
            <div className="divide-y divide-[#f1f3f5]">
              {results.map((place) => (
                <div
                  key={place.id}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-[#f8f9fa] transition-colors cursor-pointer"
                  onClick={() => onSelect(place, isAccommodation)} // 💡 체크값 함께 전달
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-[#E6F1FB] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-[#178DD7]" />
                    </div>
                    <div>
                      <div className="text-[14px] font-medium text-[#212529]">{place.place_name}</div>
                      <div className="text-[11px] text-[#178DD7] mb-0.5">{place.category_name}</div>
                      <div className="text-[12px] text-[#6c757d]">{place.road_address_name || place.address_name}</div>
                    </div>
                  </div>
                  <button className="flex items-center gap-1 text-[12px] text-[#178DD7] hover:text-[#1278ba] flex-shrink-0 ml-3">
                    <Plus className="w-4 h-4" />
                    추가
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 💡 숙소 등록 체크박스 영역 */}
        <div className="px-5 py-4 border-t border-[#e9ecef] bg-[#f8f9fa]">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={isAccommodation} 
              onChange={(e) => setIsAccommodation(e.target.checked)}
              className="w-4 h-4 accent-[#178DD7]"
            />
            <span className="text-[13px] text-[#212529]">🏠 숙소(출발지)로 등록하여 맨 앞에 추가</span>
          </label>
        </div>

      </div>
    </div>
  );
};

export default PlaceSearchModal;