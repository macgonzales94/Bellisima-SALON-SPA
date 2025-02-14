    <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script> <!-- Script de Google Analytics -->
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-XXXXXXXXXX'); <!-- Configuración de Google Analytics -->
    </script>
    <script>
        $(document).ready(function(){
            $('.productos').slick({
                slidesToShow: 4,
                slidesToScroll: 1,
                autoplay: true,
                autoplaySpeed: 2000,
                dots: true,
                arrows: true,
            });
        });
    </script>