	const canvas=document.querySelector("#kanvas");

	 function napraviTacku(tacka,boja){
    	const ctx=canvas.getContext("2d");
    	ctx.beginPath();
			ctx.fillStyle=boja;
			ctx.strokeStyle=boja;
			ctx.arc(tacka.x,tacka.y,15,0,2*Math.PI);
			ctx.fill();
			ctx.stroke();
			ctx.closePath();
			ctx.fillStyle=null;
			ctx.strokeStyle=null;

    }

    function napraviPravu(prvaTacka, drugaTacka, boja){
	  const ctx=canvas.getContext("2d");
	  ctx.fillStyle=boja;
	  ctx.strokeStyle=boja;
	  ctx.beginPath();
	  ctx.moveTo(prvaTacka.x, prvaTacka.y);
  	  ctx.lineTo(drugaTacka.x, drugaTacka.y);
  	  ctx.stroke();
  	  ctx.closePath();
  	  ctx.fillStyle=null;
			ctx.strokeStyle=null;
    }



	let sirinaKanvasa;
	let matricaTacki=[];
	let matricaZauzetihTacki=[];
		
	let nizSlobodnihTacki=[];
	let nizTrokutova=[];
	let gameState= {
		brojac:0,
			trenutniIgrac:["Igrac A","Igrac B"],
			trenutneTacke:[],
			trenutniNizLinija:[], 
			trenutnaBoja:["blue", "orange"]
}

	class Tacka {
		constructor (x,y,r){
			this.x=x;
			this.y=y;
			this.poluprecnik=r;
		}
	}

	class Linija{
		constructor(tacka1, tacka2){
			this.pocetna=tacka1;
			this.krajnja=tacka2;
			if (tacka2.x!==tacka1.x){
			this.k=(tacka2.y-tacka1.y)/(tacka2.x-tacka1.x);
			this.n=tacka1.y-((tacka2.y-tacka1.y)/(tacka2.x-tacka1.x))*tacka1.x;
		}
		else {
			this.k=undefined;
			this.n=tacka1.x;
		}
		}

	}


	class Trokut {
		constructor(linija1, linija2, linija3){
			this.linija1=linija1;
			this.linija2=linija2;
			this.linija3=linija3;
		}
	}
	// funkcija koja sluzi za provjeru da li je igrac u jednom potezu izabrao dvije iste tacka
	function isteTacke(tacka1,tacka2){
		return tacka1.x===tacka2.x && tacka1.y===tacka2.y;
	}

	function paralelne(linija1,linija2){
		return linija1.k===linija2.k;
	}

	// pomocna funkcija koja provjerava da li je trougao validan
	function imajuZajednickuTacku(linija1,linija2){
		if (isteTacke(linija1.pocetna, linija2.pocetna)||
			isteTacke(linija1.pocetna, linija2.krajnja)||
			isteTacke(linija1.krajnja, linija2.pocetna)||
			isteTacke(linija1.krajnja, linija2.krajnja))
				return true;
		return false;
	}
	// pomocna funkcija koja se pokrece na pomjeranje misa i mijenja kursor na pointer ukoliko je udaljenost kursora od centra kruga manja od poluprecnika
	function pripadaTacki(tacka1, e){
		return Math.sqrt((tacka1.x-e.pageX)*(tacka1.x-e.pageX)+(tacka1.y-e.pageY)*(tacka1.y-e.pageY))<tacka1.poluprecnik;


	}
	// pomocna funkcija kod racunanja presjeka dvije prave 
	function pripada(tacka, linija){
		if (tacka.x>=Math.min(linija.pocetna.x, linija.krajnja.x)&&tacka.x<=Math.max(linija.pocetna.x, linija.krajnja.x)
			&&tacka.y>=Math.min(linija.pocetna.y, linija.krajnja.y)&& tacka.y<=Math.max(linija.pocetna.y, linija.krajnja.y))
				return true;

		return false;	

	}


	// pronalazi tacku presjeka izmedju dvije prave i salje je funkciji iznad (slucaj 1: obje prave su oblika y=kx+n, slucaj 2 i 3: jedna prava je oblika x=n)
	function sijekuLiSe(linija1,linija2){
		let xPresjeka;
		let yPresjeka;
		if (linija1.k===linija2.k) return false;
		if (linija1.k!==undefined&&linija2.k!==undefined){
				xPresjeka=(linija2.n-linija1.n)/(linija1.k-linija2.k);
				yPresjeka=linija1.k*xPresjeka+linija1.n;
	}
		else if (linija1.k===undefined && linija2.k!==undefined){
				xPresjeka=linija1.n;
				yPresjeka=linija2.k*xPresjeka+linija2.n;

		}

		else if (linija1.k!==undefined && linija2.k===undefined){
				xPresjeka=linija2.n;
				xPresjeka=xPresjeka.toFixed(2);
				yPresjeka=linija1.k*xPresjeka+linija1.n;
				yPresjeka=yPresjeka.toFixed(2);

		}
		let privremenaTacka=new Tacka (xPresjeka, yPresjeka);
		if (pripada(privremenaTacka, linija1)&&pripada(privremenaTacka, linija2)) return true;
		return false;

	}

	function pravaSijeceTrokut(linija, trokut){
			return (sijekuLiSe(linija, trokut.linija1)||sijekuLiSe(linija, trokut.linija2)||sijekuLiSe(linija, trokut.linija3));

	}

	function praveTrokut(linija1, linija2, linija3){
			if (!paralelne(linija1,linija2)&& !paralelne(linija1,linija3)&&!paralelne(linija3,linija2))
					 if (imajuZajednickuTacku(linija1,linija2)&&imajuZajednickuTacku(linija1,linija3)&&imajuZajednickuTacku(linija3,linija2))
							return true;
			return false;
		}

  // Funkcija za izračunavanje udaljenosti između tačke (x, y) i prave ax + by + c preko formule 
  function udaljenostOdPrave(x, y, a, b, c) {
		
    	return Math.abs(a * x + b * y + c) / Math.sqrt(a * a + b * b);

}
// Funkcija koja provjerava da li prava siječe krug
function pravaSijeceKrug(prava, krug) {
    // Izračunaj udaljenost između centra kruga i prave
			if (prava.k!==undefined){
		if (krug.x>=Math.min(prava.pocetna.x, prava.krajnja.x)&& krug.y>=Math.min(prava.pocetna.y, prava.krajnja.y)&&
			krug.x<=Math.max(prava.pocetna.x, prava.krajnja.x)&& krug.y<=Math.max(prava.pocetna.y, prava.krajnja.y)){
    var udaljenost = udaljenostOdPrave(krug.x, krug.y, prava.k, -1, prava.n);

    // Proveri da li je udaljenost manja od poluprečnika kruga
    return udaljenost < krug.poluprecnik;}
    else return false;}
    else {
    	if (krug.x>=Math.min(prava.pocetna.x, prava.krajnja.x)&& krug.y>=Math.min(prava.pocetna.y, prava.krajnja.y)&&
			krug.x<=Math.max(prava.pocetna.x, prava.krajnja.x)&& krug.y<=Math.max(prava.pocetna.y, prava.krajnja.y)) 
    return prava.n===krug.x;
  	else return false;
    
}}


	// funkcija koja mijenja boje tackama u slucaju 1 kada je samo tacka odabrana i u slucaju 2 kada zauzimamo sve tacke kroz koje jedna prava prolazi
		function zauzmiTacku(tacka=null, linija=null){
			if (tacka!==null){
			for (let i=0;i<matricaTacki.length;i++){
				for (let j=0;j<matricaTacki[i].length;j++){
					if (tacka.x===matricaTacki[i][j].x && tacka.y===matricaTacki[i][j].y){
						matricaZauzetihTacki[i][j]=true;
						for (let k=0;k<nizSlobodnihTacki.length;k++){
							if (nizSlobodnihTacki[k].x===matricaTacki[i][j].x && nizSlobodnihTacki[k].y===matricaTacki[i][j].y){
								nizSlobodnihTacki.splice(k,1);
							}
						}
						break;
					}
				}
			}
		}
			if (linija!==null){
				for (let i=0;i<matricaTacki.length;i++){
				for (let j=0;j<matricaTacki[i].length;j++){
					if (pravaSijeceKrug(linija, matricaTacki[i][j]) && matricaZauzetihTacki[i][j]==false){
						napraviTacku(matricaTacki[i][j], gameState.trenutnaBoja[gameState.brojac] );
						matricaZauzetihTacki[i][j]=true;
						for (let k=0;k<nizSlobodnihTacki.length;k++){
							if (nizSlobodnihTacki[k].x===matricaTacki[i][j].x && nizSlobodnihTacki[k].y===matricaTacki[i][j].y){
								nizSlobodnihTacki.splice(k,1);
							}
						}
					}
				}
			}

			}

		}
		// kreiranje igre i pravljenje eventListenera ukoliko prvi put pokrecemo igru
		function pripremiIgru(m,n, sirina, prva=true){
			sirinaKanvasa=sirina;
			praveSaStrane(gameState.trenutnaBoja[0]);
			let dok=document.querySelector(".trenutniIgrac");
      dok.innerHTML=`${gameState.trenutniIgrac[0]}`;
      dok.style.backgroundColor=gameState.trenutnaBoja[0];
      dok=document.querySelector("#kanvas");
      dok.style.border=`1px solid ${gameState.trenutnaBoja[0]}`

			const canvas=document.querySelector("#kanvas");
	const ctx=canvas.getContext("2d");
	for (let i=0;i<m;i++){
		let trenutniRed=[];
		for (let j=0;j<n;j++){
			trenutniRed.push(0);
		}
		matricaTacki.push(trenutniRed);
	}
	for (let i=0;i<m;i++){
		let trenutniRed=[];
		for (let j=0;j<n;j++){
			trenutniRed.push(false);
		}
		matricaZauzetihTacki.push(trenutniRed);
	}
			for (let i=0;i<m;i++){
				for (let j=0;j<n;j++){
					let tacka=new Tacka((sirina-150*(m-1))/2+150*i,70+80*j,15);
					napraviTacku(tacka, "white" );
					matricaTacki [i][j]=tacka;
					nizSlobodnihTacki.push(tacka);
				}

			}
			if (prva){
			canvas.addEventListener('mousedown', function(e) {
    	const canvas=document.querySelector("#kanvas");
	const ctx=canvas.getContext("2d");
      const rect = canvas.getBoundingClientRect();
      let nalazi=false;
      let tacka=null;
      for (let i=0;i<matricaTacki.length;i++){
      	for (let j=0;j<matricaTacki[i].length;j++){
      		if (pripadaTacki(matricaTacki[i][j],e) && matricaZauzetihTacki[i][j]===false) {
      			nalazi=true;
      			tacka=matricaTacki[i][j];
      		}
      	}
      }



      if (nalazi){
      		igraj(tacka);
  	}
    });
			canvas.addEventListener('mousemove', function(e){
		const rect = canvas.getBoundingClientRect();
      let nalazi=false;
      
      for (let i=0;i<matricaTacki.length;i++){
      	for (let j=0;j<matricaTacki[i].length;j++){
      		if (pripadaTacki(matricaTacki[i][j],e) && matricaZauzetihTacki[i][j]==false) {
      			nalazi=true;
      			tacka=matricaTacki[i][j];
      		}
      	}
      }
      if (nalazi){
      	document.querySelector("#kanvas").style.cursor="pointer";
      	
  	  }
  	  else{
  	  	document.querySelector("#kanvas").style.cursor="default";

  	  }
	} );
		}	
	}
	// priprema igre u obliku trokuta
	function pripremiSpecijalnuIgru(m, sirina, prva=true){
			sirinaKanvasa=sirina;
			praveSaStrane(gameState.trenutnaBoja[0]);
			let dok=document.querySelector(".trenutniIgrac");
      dok.innerHTML=`${gameState.trenutniIgrac[0]}`;
      dok.style.backgroundColor=gameState.trenutnaBoja[0];
      dok=document.querySelector("#kanvas");
      dok.style.border=`1px solid ${gameState.trenutnaBoja[0]}`

			const canvas=document.querySelector("#kanvas");
	const ctx=canvas.getContext("2d");
	for (let i=0;i<m;i++){
		let trenutniRed=[];
		for (let j=0;j<m-i;j++){
			trenutniRed.push(0);
		}
		matricaTacki.push(trenutniRed);
	}
	for (let i=0;i<m;i++){
		let trenutniRed=[];
		for (let j=0;j<m-i;j++){
			trenutniRed.push(false);
		}
		matricaZauzetihTacki.push(trenutniRed);
	}
			for (let i=0;i<m;i++){
				for (let j=0;j<m-i;j++){
					let tacka=new Tacka((sirina-150*(m-1))/2+150*i,70+80*j,15);
					napraviTacku(tacka, "white" );
					matricaTacki [i][j]=tacka;
					nizSlobodnihTacki.push(tacka);
				}

			}
			if (prva){
			canvas.addEventListener('mousedown', function(e) {
    	const canvas=document.querySelector("#kanvas");
	const ctx=canvas.getContext("2d");
      const rect = canvas.getBoundingClientRect();
      let nalazi=false;
      let tacka=null;
      for (let i=0;i<matricaTacki.length;i++){
      	for (let j=0;j<matricaTacki[i].length;j++){
      		if (pripadaTacki(matricaTacki[i][j],e) && matricaZauzetihTacki[i][j]===false) {
      			nalazi=true;
      			tacka=matricaTacki[i][j];
      		}
      	}
      }



      if (nalazi){
      		igraj(tacka);
  	}
    });
			canvas.addEventListener('mousemove', function(e){
		const rect = canvas.getBoundingClientRect();
      let nalazi=false;
      
      for (let i=0;i<matricaTacki.length;i++){
      	for (let j=0;j<matricaTacki[i].length;j++){
      		if (pripadaTacki(matricaTacki[i][j],e) && matricaZauzetihTacki[i][j]==false) {
      			nalazi=true;
      			tacka=matricaTacki[i][j];
      		}
      	}
      }
      if (nalazi){
      	document.querySelector("#kanvas").style.cursor="pointer";
      	
  	  }
  	  else{
  	  	document.querySelector("#kanvas").style.cursor="default";

  	  }
	} );
		}	
	}
		// provjerava da li se od svih preostalih slobodnih tacaka moze napraviti validan trokut koji ne sijece ostale trokutove
		function krajIgre(){
			let kraj=true;
			let moze=true;
			for (let i=0;i<nizSlobodnihTacki.length-2;i++){
				for (let j=i+1;j<nizSlobodnihTacki.length-1;j++){
						for (let k=j+1;k<nizSlobodnihTacki.length;k++ ){ 
							moze=true;
							let linija1=new Linija(nizSlobodnihTacki[i], nizSlobodnihTacki[j]);
							let linija2=new Linija(nizSlobodnihTacki[i], nizSlobodnihTacki[k]);
							let linija3=new Linija(nizSlobodnihTacki[j], nizSlobodnihTacki[k]);
							if (praveTrokut(linija1,linija2,linija3)){
								for (let a=0;a<nizTrokutova.length;a++){
									if (pravaSijeceTrokut(linija1, nizTrokutova[a])
									 || pravaSijeceTrokut(linija2, nizTrokutova[a])
									 || pravaSijeceTrokut(linija3, nizTrokutova[a])) {moze=false;}}
												
										if (moze){
											kraj=false;
										i=nizSlobodnihTacki.length-2;
										j=nizSlobodnihTacki.length-1;
										k=nizSlobodnihTacki.length;
										break;
									}

								


							}



						}
				}
			}
			return kraj;



		}


		function promijeniIgraca(){
			  gameState.brojac=(gameState.brojac+1)%2;
				let dok=document.querySelector(".trenutniIgrac");
				dok.innerHTML=`${gameState.trenutniIgrac[gameState.brojac]}`;
				dok.style.backgroundColor=` ${gameState.trenutnaBoja[gameState.brojac]}`;
				 dok=document.querySelector("#kanvas");
     		 dok.style.border=`1px solid ${gameState.trenutnaBoja[gameState.brojac]}`
     		 praveSaStrane(gameState.trenutnaBoja[gameState.brojac]);





		}

    		function igraj(tacka){

    			
    			if (gameState.trenutneTacke.length===0){
    				if (!provjeriMogucnosti(tacka)){
    					alert("iz te tacke nemate mogucih opcija");
    					return;
    				}
    				else{
    					gameState.trenutneTacke.push(tacka);
    			napraviTacku(gameState.trenutneTacke[0], gameState.trenutnaBoja[gameState.brojac]);
    			zauzmiTacku(gameState.trenutneTacke[0]);}
    		}
    			else if (gameState.trenutneTacke.length===1){
    				 let linija=new Linija (gameState.trenutneTacke[0], tacka);
						    let sijece=false;
						    for (let i=0;i<nizTrokutova.length;i++){
						  	if (pravaSijeceTrokut(linija, nizTrokutova[i])) sijece=true;
						    }
						    if (!sijece){
						    gameState.trenutniNizLinija.push(linija);
						    gameState.trenutneTacke.push(tacka);
						    napraviPravu(gameState.trenutneTacke[0], gameState.trenutneTacke[1], gameState.trenutnaBoja[gameState.brojac]);
						    
						    napraviTacku(gameState.trenutneTacke[1], gameState.trenutnaBoja[gameState.brojac]);
						    zauzmiTacku(gameState.trenutneTacke[1]);
						    zauzmiTacku(null, linija);
    			}
    		}
    					else if (gameState.trenutneTacke.length===2){
    				 let linija=new Linija (gameState.trenutneTacke[0],tacka); 
    				 let linija2=new Linija (gameState.trenutneTacke[1],tacka);

						    let sijece=false;
						    for (let i=0;i<nizTrokutova.length;i++){
						  	if (pravaSijeceTrokut(linija, nizTrokutova[i])||pravaSijeceTrokut(linija2, nizTrokutova[i])) sijece=true;
						    }
						    if (!sijece && praveTrokut(gameState.trenutniNizLinija[0], linija, linija2) ){
						    	gameState.trenutneTacke.push(tacka);
						    gameState.trenutniNizLinija.push(linija);
						    gameState.trenutniNizLinija.push(linija2);
						    napraviPravu(gameState.trenutneTacke[0], gameState.trenutneTacke[2], gameState.trenutnaBoja[gameState.brojac]);
						    napraviPravu(gameState.trenutneTacke[1], gameState.trenutneTacke[2], gameState.trenutnaBoja[gameState.brojac]);
						    
						    
						    napraviTacku(gameState.trenutneTacke[2], gameState.trenutnaBoja[gameState.brojac]);
						    let trokut=new Trokut (gameState.trenutniNizLinija[0], gameState.trenutniNizLinija[1], gameState.trenutniNizLinija[2]);
						    nizTrokutova.push(trokut);
						    for (let i=0;i<gameState.trenutneTacke.length;i++){
						    	zauzmiTacku(gameState.trenutneTacke[i]);
						    }
						    for (let i=0;i<gameState.trenutniNizLinija.length;i++){
						    	zauzmiTacku(null, gameState.trenutniNizLinija[i]);
						    }
						    zauzmiTacku(null, linija);
						    zauzmiTacku(null, linija2);
						    if (gameState.trenutneTacke.length===3) {
    						gameState.trenutneTacke=[];
						    gameState.trenutniNizLinija=[];
						    if (!krajIgre()){
								   	promijeniIgraca();}
							else{
								setTimeout(() => {
    								zavrsiIgru();
											}, 2000);
							
								 }
    		}

    			}
		    			
    		}

    		

    		}
    		function zavrsiIgru(){
								const ctx=canvas.getContext("2d");
								ctx.clearRect(0, 0, canvas.width, canvas.height);
								let dok=document.querySelector("#kanvas");
								dok.style.display="none";
								 dok=document.querySelector(".trenutniIgrac");
								dok.style.display="none";
								 dok=document.querySelector(".opcija");
								dok.style.display="flex";
								dok.style.backgroundColor=`${gameState.trenutnaBoja[gameState.brojac]}`
								    dok=document.querySelector(".pobjednik");
								    dok.style.display="flex";
								    dok.style.backgroundColor=`${gameState.trenutnaBoja[gameState.brojac]}`;
								    dok=document.querySelector(".pobjeda");
								    dok.innerHTML=`pobjednik je ${gameState.trenutniIgrac[gameState.brojac]}`;
    		}

    		function novaIgra(m,n, sirina){

    			if (gameState.trenutniIgrac[0]==="Igrac A"){
    				gameState.trenutniIgrac=["Igrac B", "Igrac A"];
    				gameState.trenutnaBoja=["orange", "blue"];
    			}
    			else{
    				gameState.trenutniIgrac=["Igrac A", "Igrac B"];
    				gameState.trenutnaBoja=["blue", "orange"];
    			}
    			gameState.brojac=0;
    			matricaTacki=[];
 					matricaZauzetihTacki=[];
		
					nizSlobodnihTacki=[];
	 				nizTrokutova=[];
					let dok=document.querySelector('.trenutniIgrac');
					dok.style.display='flex';
					dok.style.backgroundColor=`${gameState.trenutnaBoja[gameState.brojac]}`;
					dok=document.querySelector(".opcija");
								dok.style.display="none"
		    	dok=document.querySelector('.pobjednik');
			    dok.style.display='none';
			    dok=document.querySelector('.pobjeda');
			    dok.innerHTML=``;
			    dok=document.querySelector('#kanvas');
			    dok.style.display="block"
					pripremiIgru(m,n, sirina, false);
    		}
    		function novaSpecijalnaIgra(m, sirina){

    			if (gameState.trenutniIgrac[0]==="Igrac A"){
    				gameState.trenutniIgrac=["Igrac B", "Igrac A"];
    				gameState.trenutnaBoja=["orange", "blue"];
    				
    			}
    			else{
    				gameState.trenutniIgrac=["Igrac A", "Igrac B"];
    				gameState.trenutnaBoja=["blue", "orange"];
    				
    			}
    			gameState.brojac=0;
    			matricaTacki=[];
 					matricaZauzetihTacki=[];
		
					nizSlobodnihTacki=[];
	 				nizTrokutova=[];
					let dok=document.querySelector('.trenutniIgrac');
					dok.style.display='flex';
					dok.style.backgroundColor=`${gameState.trenutnaBoja[gameState.brojac]}`;
					dok=document.querySelector(".opcija");
								dok.style.display="none"
		    	dok=document.querySelector('.pobjednik');
			    dok.style.display='none';
			    dok=document.querySelector('.pobjeda');
			    dok.innerHTML=``;
			    dok=document.querySelector('#kanvas');
			    dok.style.display="block"
					pripremiSpecijalnuIgru(m, sirina, false);
    		}

    		// funkcija kojom obiljezavamo koji je igrac na redu
    		function praveSaStrane(boja){
    			const ctx=canvas.getContext("2d");
    			ctx.clearRect(40,70,20,530);
    			ctx.clearRect(sirinaKanvasa-60,70,20,530);
    		let tacka1=new Tacka (50,80);
    		let tacka2=new Tacka (50,600);
    		napraviPravu(tacka1, tacka2, boja)
    		 tacka1=new Tacka (sirinaKanvasa-50,80);
    		 tacka2=new Tacka (sirinaKanvasa-50,600);
    		 napraviPravu(tacka1, tacka2, boja)


    }

    // ukoliko iz odabrane tacke nemamo mogucnosti za validan trokut koji ne sijece ostale trokutove izbacujemo alert
    function provjeriMogucnosti(tacka1, tacka2=null){
    		if (tacka2===null){
    			for (let i=1;i<nizSlobodnihTacki.length;i++){
    				for (let j=0;j<i;j++){
    					if (!isteTacke(tacka1, nizSlobodnihTacki[i]) && !isteTacke(tacka1, nizSlobodnihTacki[j])){
    						let linija1=new Linija(tacka1, nizSlobodnihTacki[i]);
    						let linija2=new Linija(tacka1, nizSlobodnihTacki[j]);
    						let linija3=new Linija(nizSlobodnihTacki[j], nizSlobodnihTacki[i]);
    						if (praveTrokut(linija1, linija2, linija3)){
    						let ne_sijece=true;
    						for (let k=0;k<nizTrokutova.length;k++){
    							if (pravaSijeceTrokut(linija1,nizTrokutova[k])|| pravaSijeceTrokut(linija2,nizTrokutova[k])|| pravaSijeceTrokut(linija3,nizTrokutova[k])){
    								ne_sijece=false;
    							}
								}
								if (ne_sijece){
    								return true;
    							}
    					}
    				}
    				}
    			}
    		}

    		return false;
    }