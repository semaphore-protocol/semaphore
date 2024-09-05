// SPDX-License-Identifier: GPL-3.0
/*
    Copyright 2021 0KIMS association.

    This file is generated with [snarkJS](https://github.com/iden3/snarkjs).

    snarkJS is a free software: you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    snarkJS is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
    License for more details.

    You should have received a copy of the GNU General Public License
    along with snarkJS. If not, see <https://www.gnu.org/licenses/>.
*/

pragma solidity >=0.8.0;

/// @title ZKEdDSA Event Ticket PCD Verifier Contract.
/// @notice This contract verifies ZK EdDSA Event Ticket Proof Carrying Data (PCD) proofs.
/// It utilizes the scalar and base field sizes, along with various constants for verification.
/// The main functionality is provided by the `verifyProof` function, which performs a zk-SNARK verification
/// using elliptic curve pairings.
/// This contract has been generated from the following artifacts and adapted to solidity >=0.8.0 version syntax.
/// https://github.com/proofcarryingdata/zupass/tree/main/packages/pcd/zk-eddsa-event-ticket-pcd/artifacts
contract ZKEdDSAEventTicketPCDVerifier {
    // Scalar field size
    uint256 private constant r = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    // Base field size
    uint256 private constant q = 21888242871839275222246405745257275088696311157297823662689037894645226208583;

    // Verification Key data
    uint256 private constant alphax = 20491192805390485299153009773594534940189261866228447918068658471970481763042;
    uint256 private constant alphay = 9383485363053290200918347156157836566562967994039712273449902621266178545958;
    uint256 private constant betax1 = 4252822878758300859123897981450591353533073413197771768651442665752259397132;
    uint256 private constant betax2 = 6375614351688725206403948262868962793625744043794305715222011528459656738731;
    uint256 private constant betay1 = 21847035105528745403288232691147584728191162732299865338377159692350059136679;
    uint256 private constant betay2 = 10505242626370262277552901082094356697409835680220590971873171140371331206856;
    uint256 private constant gammax1 = 11559732032986387107991004021392285783925812861821192530917403151452391805634;
    uint256 private constant gammax2 = 10857046999023057135944570762232829481370756359578518086990519993285655852781;
    uint256 private constant gammay1 = 4082367875863433681332203403145435568316851327593401208105741076214120093531;
    uint256 private constant gammay2 = 8495653923123431417604973247489272438418190587263600148770280649306958101930;
    uint256 private constant deltax1 = 4794378188555673810018158797263945613117081424700154854974240721894252090534;
    uint256 private constant deltax2 = 1816911282723953521360374096804693609948256596921895265929104078200823204675;
    uint256 private constant deltay1 = 4822598240965235353021859310978490456254180072341966996061361969858340984511;
    uint256 private constant deltay2 = 13543378357184474310383646423534605062703850124878450029441667582061275654866;

    uint256 private constant IC0x = 7039163794843290796256368468693852992261864980639380847782867461741038210431;
    uint256 private constant IC0y = 13828571545952070419695572439672637697093967550127663217094587479939756801713;

    uint256 private constant IC1x = 3958090907019850444580447271310783643067855398231992297257715727710216995446;
    uint256 private constant IC1y = 20221946439601599894288820734713434259239717191029254240067234373135565758177;

    uint256 private constant IC2x = 900186639711238933493055667378009920193627212372904879368486442415809327595;
    uint256 private constant IC2y = 2326167641766524616999631967433198170614424673993051767085816973791951172320;

    uint256 private constant IC3x = 5036413725381298640320115097177392324444247429122196014822193539177279161834;
    uint256 private constant IC3y = 16915948281029825623174724126850423768748230097781953657414920017958567938481;

    uint256 private constant IC4x = 18760100143371695362362583151699410223835931838504964976371030235483771799520;
    uint256 private constant IC4y = 11050897648840559830340797268632494985552806330900971650426635140540632129623;

    uint256 private constant IC5x = 14405103043934777929451041926853384737748587264397789238453021115804714011027;
    uint256 private constant IC5y = 17654525523246776275961068512159018488399387144246684730694339431289852689612;

    uint256 private constant IC6x = 8723869934697142623491762263289398094319535893464503540125898389370968107859;
    uint256 private constant IC6y = 6562444046746975238614247431088671155226534237756214900132774223548393484900;

    uint256 private constant IC7x = 14577478605943949020672432197678273024089978103276775373202577864795436168402;
    uint256 private constant IC7y = 20868380911669423225158693169242758989558229682271980505657366061586596203338;

    uint256 private constant IC8x = 15078791307200682406383940510187595016164044832563024269891293768166347461344;
    uint256 private constant IC8y = 13807879254500296471557402479543820453954075404741718297177665886866496451391;

    uint256 private constant IC9x = 11961110457054262187040141268827975035460766426109310097612340764580611314242;
    uint256 private constant IC9y = 648031620139716874034542002574123681367629070550974595278392168004036814626;

    uint256 private constant IC10x = 9897786420777014154834245148124872045575237833648028105961996898423566286793;
    uint256 private constant IC10y = 10942250463782575990311669310939232003635777350050348004971415243722694683862;

    uint256 private constant IC11x = 21768976691153943693253939674737520933075287952326155542834234684045105263955;
    uint256 private constant IC11y = 2652628038258207868440308689934020510765602358527332281459263595352308874872;

    uint256 private constant IC12x = 10579889892022441902715761343940775692321155123038188581132868576263856691960;
    uint256 private constant IC12y = 14197080288473739214766468387110821163678798975745451452929084680507366969089;

    uint256 private constant IC13x = 17381487274016777148244396779385401991045642828052327241661444508026488993960;
    uint256 private constant IC13y = 12631141756649305162072161190046426727112068887466313087474366448379889938290;

    uint256 private constant IC14x = 13935047382751423896533075574654791455853724928466459591893970338304052339429;
    uint256 private constant IC14y = 6824865220976543574218366346391934951925243253294023634161017592510424936549;

    uint256 private constant IC15x = 7031992312358334117229960826366500136698824958913380375057168422867887208482;
    uint256 private constant IC15y = 6487726177217344454795293919275011847002886774229625835362883818222058658917;

    uint256 private constant IC16x = 32761952607172566377921792852655350243312728025797797731884919650955995978;
    uint256 private constant IC16y = 17109740037766941001038815791052639848028856032033398873318266457482577886649;

    uint256 private constant IC17x = 5148130823680965556573321200326358804854949261914205931196224467597274599399;
    uint256 private constant IC17y = 17786165933748885174698871854113633988020047930367652317579732342918892135076;

    uint256 private constant IC18x = 19132395236354116173686960242674593409872273373618210170105548787911478039676;
    uint256 private constant IC18y = 13128673728382375315191668017332103847318829241457370626993176402741448018866;

    uint256 private constant IC19x = 14279232715058070388045405059532116192488308995813346048366203712476135182708;
    uint256 private constant IC19y = 15194615736824271563039224473810596003691641177247333143890653748759024086797;

    uint256 private constant IC20x = 9955090722504979957069720304999125823978111318362496584519854575527608185162;
    uint256 private constant IC20y = 5794103785028496675031047406750626512072617762810766655823567669958439141907;

    uint256 private constant IC21x = 3093386023754979021969916793626732114241059635051234406414231194529079272032;
    uint256 private constant IC21y = 2726333648975816401517500089384058227785233536677037001841489035806732587931;

    uint256 private constant IC22x = 5277410462435782523915882980275775886349488617157850699431034750288036800613;
    uint256 private constant IC22y = 21607346138964363953763925149731352915511002970774217667749452112345555034956;

    uint256 private constant IC23x = 2882073216919257197946498011741429525374768355767062401579097340303609014667;
    uint256 private constant IC23y = 13336208254651518889575781043861573326120722149864211966571295065261003981732;

    uint256 private constant IC24x = 16518085772523452403713249212239346119989769943791821955471370367814804849274;
    uint256 private constant IC24y = 3163851008551205343892721959924291514513839424028748364301581737083684712635;

    uint256 private constant IC25x = 21443140829801323335830440272589422531303604169183393653690045415169893110317;
    uint256 private constant IC25y = 11843677807581613645245376500039550313868511109982120780557566436801551936632;

    uint256 private constant IC26x = 9011343512724109228637988929452301928814416148302399365691495043540007452711;
    uint256 private constant IC26y = 19203719374228430540624285138844258546893532214993666117722702463877026204624;

    uint256 private constant IC27x = 12282563786492051221220863019504107834872987144162405093912833624832473504126;
    uint256 private constant IC27y = 2098404497662286606968957419285970045028044455644658720985187205946176225636;

    uint256 private constant IC28x = 1990701565738088758270472967471263340707808628204302356692995713089340295959;
    uint256 private constant IC28y = 4710902959112092813812405997875645709469153185247079786406984810436621334836;

    uint256 private constant IC29x = 20358882933388981503171778761697392336011378779059025555927722043477769063258;
    uint256 private constant IC29y = 19015855458316650610909766042056506990773552974154423789621320056338171324109;

    uint256 private constant IC30x = 20882010929117143317945388885678484675687595287997043750607534940060968021588;
    uint256 private constant IC30y = 11586557172082174037613559244105184201710114582175280732260566723406709924275;

    uint256 private constant IC31x = 9866308320093007323457785354472236077116309736444536950583247217505300484593;
    uint256 private constant IC31y = 7621726862256096662846253511430079218096624239819015602672239587875065773680;

    uint256 private constant IC32x = 14027123489779385457612700332560563436358522575256251872455086560940806515518;
    uint256 private constant IC32y = 10938955322537907189548948078384029109133599816409669950598646265343304376683;

    uint256 private constant IC33x = 8185779524540657541561125117577265603809435796152263318353366879537563587361;
    uint256 private constant IC33y = 7022890698869206227386505409956869964786133909878013184769185704625348906859;

    uint256 private constant IC34x = 11611413113751908909193648245064739218553980961929170910199270975967104957038;
    uint256 private constant IC34y = 18994807587760619856245913328685591005051029724453337667407306111138944756694;

    uint256 private constant IC35x = 200383746952988761639379177517104787510472386926528110614397950418667358661;
    uint256 private constant IC35y = 20007848431425763869830663340890269703980870987344402378604194352912831137056;

    uint256 private constant IC36x = 328413860030399674842447170312944751562586291423774720425356928068580343472;
    uint256 private constant IC36y = 5189648959630633293821012021210812639351882790811543893302480708749969871675;

    uint256 private constant IC37x = 6012328917803371026931141367320642434394368982571440096775691385288621172219;
    uint256 private constant IC37y = 3144007704082241276171331516247837779546266689067323035946808770824524079278;

    uint256 private constant IC38x = 6432946433062452526687536616554972830856614963273241146116338471741671687252;
    uint256 private constant IC38y = 15585047391247849588392219751347369098681511169371119693472990059654876497118;

    // Memory data
    uint16 private constant pVk = 0;
    uint16 private constant pPairing = 128;

    uint16 private constant pLastMem = 896;

    /* solhint-disable */
    function verifyProof(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[38] calldata _pubSignals
    ) public view returns (bool) {
        assembly {
            function checkField(v) {
                if iszero(lt(v, r)) {
                    mstore(0, 0)
                    return(0, 0x20)
                }
            }

            // G1 function to multiply a G1 value(x,y) to value in an address
            function g1_mulAccC(pR, x, y, s) {
                let success
                let mIn := mload(0x40)
                mstore(mIn, x)
                mstore(add(mIn, 32), y)
                mstore(add(mIn, 64), s)

                success := staticcall(sub(gas(), 2000), 7, mIn, 96, mIn, 64)

                if iszero(success) {
                    mstore(0, 0)
                    return(0, 0x20)
                }

                mstore(add(mIn, 64), mload(pR))
                mstore(add(mIn, 96), mload(add(pR, 32)))

                success := staticcall(sub(gas(), 2000), 6, mIn, 128, pR, 64)

                if iszero(success) {
                    mstore(0, 0)
                    return(0, 0x20)
                }
            }

            function checkPairing(pA, pB, pC, pubSignals, pMem) -> isOk {
                let _pPairing := add(pMem, pPairing)
                let _pVk := add(pMem, pVk)

                mstore(_pVk, IC0x)
                mstore(add(_pVk, 32), IC0y)

                // Compute the linear combination vk_x

                g1_mulAccC(_pVk, IC1x, IC1y, calldataload(add(pubSignals, 0)))

                g1_mulAccC(_pVk, IC2x, IC2y, calldataload(add(pubSignals, 32)))

                g1_mulAccC(_pVk, IC3x, IC3y, calldataload(add(pubSignals, 64)))

                g1_mulAccC(_pVk, IC4x, IC4y, calldataload(add(pubSignals, 96)))

                g1_mulAccC(_pVk, IC5x, IC5y, calldataload(add(pubSignals, 128)))

                g1_mulAccC(_pVk, IC6x, IC6y, calldataload(add(pubSignals, 160)))

                g1_mulAccC(_pVk, IC7x, IC7y, calldataload(add(pubSignals, 192)))

                g1_mulAccC(_pVk, IC8x, IC8y, calldataload(add(pubSignals, 224)))

                g1_mulAccC(_pVk, IC9x, IC9y, calldataload(add(pubSignals, 256)))

                g1_mulAccC(_pVk, IC10x, IC10y, calldataload(add(pubSignals, 288)))

                g1_mulAccC(_pVk, IC11x, IC11y, calldataload(add(pubSignals, 320)))

                g1_mulAccC(_pVk, IC12x, IC12y, calldataload(add(pubSignals, 352)))

                g1_mulAccC(_pVk, IC13x, IC13y, calldataload(add(pubSignals, 384)))

                g1_mulAccC(_pVk, IC14x, IC14y, calldataload(add(pubSignals, 416)))

                g1_mulAccC(_pVk, IC15x, IC15y, calldataload(add(pubSignals, 448)))

                g1_mulAccC(_pVk, IC16x, IC16y, calldataload(add(pubSignals, 480)))

                g1_mulAccC(_pVk, IC17x, IC17y, calldataload(add(pubSignals, 512)))

                g1_mulAccC(_pVk, IC18x, IC18y, calldataload(add(pubSignals, 544)))

                g1_mulAccC(_pVk, IC19x, IC19y, calldataload(add(pubSignals, 576)))

                g1_mulAccC(_pVk, IC20x, IC20y, calldataload(add(pubSignals, 608)))

                g1_mulAccC(_pVk, IC21x, IC21y, calldataload(add(pubSignals, 640)))

                g1_mulAccC(_pVk, IC22x, IC22y, calldataload(add(pubSignals, 672)))

                g1_mulAccC(_pVk, IC23x, IC23y, calldataload(add(pubSignals, 704)))

                g1_mulAccC(_pVk, IC24x, IC24y, calldataload(add(pubSignals, 736)))

                g1_mulAccC(_pVk, IC25x, IC25y, calldataload(add(pubSignals, 768)))

                g1_mulAccC(_pVk, IC26x, IC26y, calldataload(add(pubSignals, 800)))

                g1_mulAccC(_pVk, IC27x, IC27y, calldataload(add(pubSignals, 832)))

                g1_mulAccC(_pVk, IC28x, IC28y, calldataload(add(pubSignals, 864)))

                g1_mulAccC(_pVk, IC29x, IC29y, calldataload(add(pubSignals, 896)))

                g1_mulAccC(_pVk, IC30x, IC30y, calldataload(add(pubSignals, 928)))

                g1_mulAccC(_pVk, IC31x, IC31y, calldataload(add(pubSignals, 960)))

                g1_mulAccC(_pVk, IC32x, IC32y, calldataload(add(pubSignals, 992)))

                g1_mulAccC(_pVk, IC33x, IC33y, calldataload(add(pubSignals, 1024)))

                g1_mulAccC(_pVk, IC34x, IC34y, calldataload(add(pubSignals, 1056)))

                g1_mulAccC(_pVk, IC35x, IC35y, calldataload(add(pubSignals, 1088)))

                g1_mulAccC(_pVk, IC36x, IC36y, calldataload(add(pubSignals, 1120)))

                g1_mulAccC(_pVk, IC37x, IC37y, calldataload(add(pubSignals, 1152)))

                g1_mulAccC(_pVk, IC38x, IC38y, calldataload(add(pubSignals, 1184)))

                // -A
                mstore(_pPairing, calldataload(pA))
                mstore(add(_pPairing, 32), mod(sub(q, calldataload(add(pA, 32))), q))

                // B
                mstore(add(_pPairing, 64), calldataload(pB))
                mstore(add(_pPairing, 96), calldataload(add(pB, 32)))
                mstore(add(_pPairing, 128), calldataload(add(pB, 64)))
                mstore(add(_pPairing, 160), calldataload(add(pB, 96)))

                // alpha1
                mstore(add(_pPairing, 192), alphax)
                mstore(add(_pPairing, 224), alphay)

                // beta2
                mstore(add(_pPairing, 256), betax1)
                mstore(add(_pPairing, 288), betax2)
                mstore(add(_pPairing, 320), betay1)
                mstore(add(_pPairing, 352), betay2)

                // vk_x
                mstore(add(_pPairing, 384), mload(add(pMem, pVk)))
                mstore(add(_pPairing, 416), mload(add(pMem, add(pVk, 32))))

                // gamma2
                mstore(add(_pPairing, 448), gammax1)
                mstore(add(_pPairing, 480), gammax2)
                mstore(add(_pPairing, 512), gammay1)
                mstore(add(_pPairing, 544), gammay2)

                // C
                mstore(add(_pPairing, 576), calldataload(pC))
                mstore(add(_pPairing, 608), calldataload(add(pC, 32)))

                // delta2
                mstore(add(_pPairing, 640), deltax1)
                mstore(add(_pPairing, 672), deltax2)
                mstore(add(_pPairing, 704), deltay1)
                mstore(add(_pPairing, 736), deltay2)

                let success := staticcall(sub(gas(), 2000), 8, _pPairing, 768, _pPairing, 0x20)

                isOk := and(success, mload(_pPairing))
            }

            let pMem := mload(0x40)
            mstore(0x40, add(pMem, pLastMem))

            // Validate that all evaluations ∈ F

            checkField(calldataload(add(_pubSignals, 0)))

            checkField(calldataload(add(_pubSignals, 32)))

            checkField(calldataload(add(_pubSignals, 64)))

            checkField(calldataload(add(_pubSignals, 96)))

            checkField(calldataload(add(_pubSignals, 128)))

            checkField(calldataload(add(_pubSignals, 160)))

            checkField(calldataload(add(_pubSignals, 192)))

            checkField(calldataload(add(_pubSignals, 224)))

            checkField(calldataload(add(_pubSignals, 256)))

            checkField(calldataload(add(_pubSignals, 288)))

            checkField(calldataload(add(_pubSignals, 320)))

            checkField(calldataload(add(_pubSignals, 352)))

            checkField(calldataload(add(_pubSignals, 384)))

            checkField(calldataload(add(_pubSignals, 416)))

            checkField(calldataload(add(_pubSignals, 448)))

            checkField(calldataload(add(_pubSignals, 480)))

            checkField(calldataload(add(_pubSignals, 512)))

            checkField(calldataload(add(_pubSignals, 544)))

            checkField(calldataload(add(_pubSignals, 576)))

            checkField(calldataload(add(_pubSignals, 608)))

            checkField(calldataload(add(_pubSignals, 640)))

            checkField(calldataload(add(_pubSignals, 672)))

            checkField(calldataload(add(_pubSignals, 704)))

            checkField(calldataload(add(_pubSignals, 736)))

            checkField(calldataload(add(_pubSignals, 768)))

            checkField(calldataload(add(_pubSignals, 800)))

            checkField(calldataload(add(_pubSignals, 832)))

            checkField(calldataload(add(_pubSignals, 864)))

            checkField(calldataload(add(_pubSignals, 896)))

            checkField(calldataload(add(_pubSignals, 928)))

            checkField(calldataload(add(_pubSignals, 960)))

            checkField(calldataload(add(_pubSignals, 992)))

            checkField(calldataload(add(_pubSignals, 1024)))

            checkField(calldataload(add(_pubSignals, 1056)))

            checkField(calldataload(add(_pubSignals, 1088)))

            checkField(calldataload(add(_pubSignals, 1120)))

            checkField(calldataload(add(_pubSignals, 1152)))

            checkField(calldataload(add(_pubSignals, 1184)))

            checkField(calldataload(add(_pubSignals, 1216)))

            // Validate all evaluations
            let isValid := checkPairing(_pA, _pB, _pC, _pubSignals, pMem)

            mstore(0, isValid)
            return(0, 0x20)
        }
    }
}
