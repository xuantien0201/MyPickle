import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-column">
              <h3>Pickleball Bồ đề</h3>
              <p className="footer-description">
                Đại lý ủy quyền pickleball số 1 Việt Nam. Uy tín tạo niềm tin.
              </p>
            </div>

            <div className="footer-column">
              <h4>Đường dẫn</h4>
              <ul>
                <li><Link to="/">Trang chủ</Link></li>
                <li><Link to="/shop">Shop</Link></li>
                <li><Link to="/shop?category=vot-pickleball">Paddles</Link></li>
                <li><Link to="/shop?category=bong-pickleball">Bóng Pickleball</Link></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Dịch vụ có sẵn</h4>
              <ul>
                <li>Có mái che</li>
                <li>Có chỗ để xe</li>
                <li>Hệ thống chiếu sáng LED chống chói hiện đại</li>
                <li>Sân có cho thuê vợt, bóng Pickleball với giá cả hợp lý</li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Liên hệ chúng tôi</h4>
              <ul className="no-list-style">
                <li><span> Địa chỉ :</span> 237 Phú Viên, Phường Bồ Đề, Quận Long Biên, Thành phố Hà Nội</li>
                <li><span> Phone :</span> <a href="tel:079 668 2288">079 668 2288</a></li>
                <li><span> Chủ sân :</span> <a href="#">Pickleball Bồ Đề</a></li>

              </ul>

            </div>
          </div>
        </div>
      </div>


    </footer>
  );
};

export default Footer;
