import React from 'react';
import UserNavbar from '../components/NavbarUser';

const Home = () => {
  return (
    <>
      <UserNavbar />

      <div className="w-full min-h-screen font-sans bg-white">
        {/* Hero Section */}
        <div
          className="w-full h-[500px] bg-cover bg-[position:top_10%_center] relative"
          style={{ backgroundImage: "url('/foto menu/background.jpg')" }}
        >
          <div className="bg-black bg-opacity-30 w-full h-full py-20 px-5 sm:px-8 md:px-16 lg:px-32 text-white text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight drop-shadow-md">
              Selamat Datang di <span className="text-white">TwoNCafe!</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl font-light">
              Silahkan Pesan makanan dan Minuman favoritmu,<br />
              Makan enak dan nyaman? <strong>TwoNCafe</strong> solusinya!
            </p>

            {/* Search Bar */}
            <div className="mt-10 flex justify-center">
              <div className="bg-white rounded-full shadow-lg flex items-center px-3 py-1 w-full max-w-2xl">
                <input
                  type="text"
                  placeholder="Ketik Makananmu"
                  className="flex-grow p-3 rounded-full outline-none text-gray-800 text-sm sm:text-base"
                />
                <button className="bg-amber-900 hover:bg-[#452121] text-white px-6 py-2 rounded-full font-semibold text-sm sm:text-base">
                  <i className="fa fa-search mr-1"></i> Cari
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Category Menu */}
        <div className="py-12 px-4 sm:px-8 md:px-16 lg:px-32 bg-gray-50">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-8 justify-items-center">
            {[
              { name: "Nasi Goreng", img: "/foto menu/icon_nasi_goreng.jpg" },
              { name: "Ayam Bakar", img: "/foto menu/icon_ayam bakar.jpg" },
              { name: "Roti", img: "/foto menu/icon_roti_cokelat.jpg" },
              { name: "Mie", img: "/foto menu/icon_mie_goreng.jpg" },
              { name: "Ayam Geprek", img: "/foto menu/icon_ayam_geprek.jpg" },
              { name: "Minuman", img: "/foto menu/icon_minuman.jpg" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-[3px] border-[#5e2d2d] shadow-lg mb-3 transition-transform hover:scale-105">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-sm sm:text-base font-semibold text-gray-800">{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
