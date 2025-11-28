import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary text-white py-12 mt-auto">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-xl font-serif font-bold mb-4">LUMINA</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            "Luminósus" - 밝고 명확한 빛. <br />
            변치 않는 악세서리로 당신의 아름다움을 비춥니다.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-serif mb-4">고객 센터</h4>
          <ul className="text-gray-400 text-sm space-y-2">
            <li><a href="#" className="hover:text-white">문의하기</a></li>
            <li><a href="#" className="hover:text-white">배송 및 반품</a></li>
            <li><a href="#" className="hover:text-white">자주 묻는 질문 (FAQ)</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-serif mb-4">Follow Us</h4>
          <div className="flex space-x-4">
            {/* Social placeholders */}
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-accent transition" role="button" aria-label="Instagram">IG</div>
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-accent transition" role="button" aria-label="Facebook">FB</div>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-xs">
        &copy; {new Date().getFullYear()} LUMINA. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;