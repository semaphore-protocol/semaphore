// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {PoseidonT3} from "poseidon-solidity/PoseidonT3.sol";
import {SNARK_SCALAR_FIELD, MAX_DEPTH} from "./Constants.sol";

struct LazyIMTData {
    uint40 maxIndex;
    uint40 numberOfLeaves;
    mapping(uint256 => uint256) elements;
}

library InternalLazyIMT {
    uint40 internal constant MAX_INDEX = (1 << 32) - 1;

    uint256 internal constant Z_0 = 0;
    uint256 internal constant Z_1 = 14744269619966411208579211824598458697587494354926760081771325075741142829156;
    uint256 internal constant Z_2 = 7423237065226347324353380772367382631490014989348495481811164164159255474657;
    uint256 internal constant Z_3 = 11286972368698509976183087595462810875513684078608517520839298933882497716792;
    uint256 internal constant Z_4 = 3607627140608796879659380071776844901612302623152076817094415224584923813162;
    uint256 internal constant Z_5 = 19712377064642672829441595136074946683621277828620209496774504837737984048981;
    uint256 internal constant Z_6 = 20775607673010627194014556968476266066927294572720319469184847051418138353016;
    uint256 internal constant Z_7 = 3396914609616007258851405644437304192397291162432396347162513310381425243293;
    uint256 internal constant Z_8 = 21551820661461729022865262380882070649935529853313286572328683688269863701601;
    uint256 internal constant Z_9 = 6573136701248752079028194407151022595060682063033565181951145966236778420039;
    uint256 internal constant Z_10 = 12413880268183407374852357075976609371175688755676981206018884971008854919922;
    uint256 internal constant Z_11 = 14271763308400718165336499097156975241954733520325982997864342600795471836726;
    uint256 internal constant Z_12 = 20066985985293572387227381049700832219069292839614107140851619262827735677018;
    uint256 internal constant Z_13 = 9394776414966240069580838672673694685292165040808226440647796406499139370960;
    uint256 internal constant Z_14 = 11331146992410411304059858900317123658895005918277453009197229807340014528524;
    uint256 internal constant Z_15 = 15819538789928229930262697811477882737253464456578333862691129291651619515538;
    uint256 internal constant Z_16 = 19217088683336594659449020493828377907203207941212636669271704950158751593251;
    uint256 internal constant Z_17 = 21035245323335827719745544373081896983162834604456827698288649288827293579666;
    uint256 internal constant Z_18 = 6939770416153240137322503476966641397417391950902474480970945462551409848591;
    uint256 internal constant Z_19 = 10941962436777715901943463195175331263348098796018438960955633645115732864202;
    uint256 internal constant Z_20 = 15019797232609675441998260052101280400536945603062888308240081994073687793470;
    uint256 internal constant Z_21 = 11702828337982203149177882813338547876343922920234831094975924378932809409969;
    uint256 internal constant Z_22 = 11217067736778784455593535811108456786943573747466706329920902520905755780395;
    uint256 internal constant Z_23 = 16072238744996205792852194127671441602062027943016727953216607508365787157389;
    uint256 internal constant Z_24 = 17681057402012993898104192736393849603097507831571622013521167331642182653248;
    uint256 internal constant Z_25 = 21694045479371014653083846597424257852691458318143380497809004364947786214945;
    uint256 internal constant Z_26 = 8163447297445169709687354538480474434591144168767135863541048304198280615192;
    uint256 internal constant Z_27 = 14081762237856300239452543304351251708585712948734528663957353575674639038357;
    uint256 internal constant Z_28 = 16619959921569409661790279042024627172199214148318086837362003702249041851090;
    uint256 internal constant Z_29 = 7022159125197495734384997711896547675021391130223237843255817587255104160365;
    uint256 internal constant Z_30 = 4114686047564160449611603615418567457008101555090703535405891656262658644463;
    uint256 internal constant Z_31 = 12549363297364877722388257367377629555213421373705596078299904496781819142130;
    uint256 internal constant Z_32 = 21443572485391568159800782191812935835534334817699172242223315142338162256601;

    function _defaultZero(uint8 index) internal pure returns (uint256) {
        if (index == 0) return Z_0;
        if (index == 1) return Z_1;
        if (index == 2) return Z_2;
        if (index == 3) return Z_3;
        if (index == 4) return Z_4;
        if (index == 5) return Z_5;
        if (index == 6) return Z_6;
        if (index == 7) return Z_7;
        if (index == 8) return Z_8;
        if (index == 9) return Z_9;
        if (index == 10) return Z_10;
        if (index == 11) return Z_11;
        if (index == 12) return Z_12;
        if (index == 13) return Z_13;
        if (index == 14) return Z_14;
        if (index == 15) return Z_15;
        if (index == 16) return Z_16;
        if (index == 17) return Z_17;
        if (index == 18) return Z_18;
        if (index == 19) return Z_19;
        if (index == 20) return Z_20;
        if (index == 21) return Z_21;
        if (index == 22) return Z_22;
        if (index == 23) return Z_23;
        if (index == 24) return Z_24;
        if (index == 25) return Z_25;
        if (index == 26) return Z_26;
        if (index == 27) return Z_27;
        if (index == 28) return Z_28;
        if (index == 29) return Z_29;
        if (index == 30) return Z_30;
        if (index == 31) return Z_31;
        if (index == 32) return Z_32;
        revert("LazyIMT: defaultZero bad index");
    }

    function _init(LazyIMTData storage self, uint8 depth) internal {
        require(depth <= MAX_DEPTH, "LazyIMT: Tree too large");
        self.maxIndex = uint40((1 << depth) - 1);
        self.numberOfLeaves = 0;
    }

    function _reset(LazyIMTData storage self) internal {
        self.numberOfLeaves = 0;
    }

    function _indexForElement(uint8 level, uint40 index) internal pure returns (uint40) {
        // store the elements sparsely
        return MAX_INDEX * level + index;
    }

    function _insert(LazyIMTData storage self, uint256 leaf) internal {
        uint40 index = self.numberOfLeaves;
        require(leaf < SNARK_SCALAR_FIELD, "LazyIMT: leaf must be < SNARK_SCALAR_FIELD");
        require(index < self.maxIndex, "LazyIMT: tree is full");

        self.numberOfLeaves = index + 1;

        uint256 hash = leaf;

        for (uint8 i = 0; ; ) {
            self.elements[_indexForElement(i, index)] = hash;
            // it's a left element so we don't hash until there's a right element
            if (index & 1 == 0) break;
            uint40 elementIndex = _indexForElement(i, index - 1);
            hash = PoseidonT3.hash([self.elements[elementIndex], hash]);
            unchecked {
                index >>= 1;
                i++;
            }
        }
    }

    function _update(LazyIMTData storage self, uint256 leaf, uint40 index) internal {
        require(leaf < SNARK_SCALAR_FIELD, "LazyIMT: leaf must be < SNARK_SCALAR_FIELD");
        uint40 numberOfLeaves = self.numberOfLeaves;
        require(index < numberOfLeaves, "LazyIMT: leaf must exist");

        uint256 hash = leaf;

        for (uint8 i = 0; true; ) {
            self.elements[_indexForElement(i, index)] = hash;
            uint256 levelCount = numberOfLeaves >> (i + 1);
            if (levelCount <= index >> 1) break;
            if (index & 1 == 0) {
                uint40 elementIndex = _indexForElement(i, index + 1);
                hash = PoseidonT3.hash([hash, self.elements[elementIndex]]);
            } else {
                uint40 elementIndex = _indexForElement(i, index - 1);
                hash = PoseidonT3.hash([self.elements[elementIndex], hash]);
            }
            unchecked {
                index >>= 1;
                i++;
            }
        }
    }

    function _root(LazyIMTData storage self) internal view returns (uint256) {
        // this will always short circuit if self.numberOfLeaves == 0
        uint40 numberOfLeaves = self.numberOfLeaves;
        // dynamically determine a depth
        uint8 depth = 1;
        while (uint40(2) ** uint40(depth) < numberOfLeaves) {
            depth++;
        }
        return _root(self, numberOfLeaves, depth);
    }

    function _root(LazyIMTData storage self, uint8 depth) internal view returns (uint256) {
        require(depth > 0, "LazyIMT: depth must be > 0");
        require(depth <= MAX_DEPTH, "LazyIMT: depth must be <= MAX_DEPTH");
        uint40 numberOfLeaves = self.numberOfLeaves;
        require(uint40(2) ** uint40(depth) >= numberOfLeaves, "LazyIMT: ambiguous depth");
        return _root(self, numberOfLeaves, depth);
    }

    // Here it's assumed that the depth value is valid. If it is either 0 or > 2^8-1
    // this function will panic.
    function _root(LazyIMTData storage self, uint40 numberOfLeaves, uint8 depth) internal view returns (uint256) {
        require(depth <= MAX_DEPTH, "LazyIMT: depth must be <= MAX_DEPTH");
        // this should always short circuit if self.numberOfLeaves == 0
        if (numberOfLeaves == 0) return _defaultZero(depth);
        uint256[] memory levels = new uint256[](depth + 1);
        _levels(self, numberOfLeaves, depth, levels);
        return levels[depth];
    }

    function _levels(
        LazyIMTData storage self,
        uint40 numberOfLeaves,
        uint8 depth,
        uint256[] memory levels
    ) internal view {
        require(depth <= MAX_DEPTH, "LazyIMT: depth must be <= MAX_DEPTH");
        require(numberOfLeaves > 0, "LazyIMT: number of leaves must be > 0");
        // this should always short circuit if self.numberOfLeaves == 0
        uint40 index = numberOfLeaves - 1;

        if (index & 1 == 0) {
            levels[0] = self.elements[_indexForElement(0, index)];
        } else {
            levels[0] = _defaultZero(0);
        }

        for (uint8 i = 0; i < depth; ) {
            if (index & 1 == 0) {
                levels[i + 1] = PoseidonT3.hash([levels[i], _defaultZero(i)]);
            } else {
                uint256 levelCount = (numberOfLeaves) >> (i + 1);
                if (levelCount > index >> 1) {
                    uint256 parent = self.elements[_indexForElement(i + 1, index >> 1)];
                    levels[i + 1] = parent;
                } else {
                    uint256 sibling = self.elements[_indexForElement(i, index - 1)];
                    levels[i + 1] = PoseidonT3.hash([sibling, levels[i]]);
                }
            }
            unchecked {
                index >>= 1;
                i++;
            }
        }
    }

    function _merkleProofElements(
        LazyIMTData storage self,
        uint40 index,
        uint8 depth
    ) internal view returns (uint256[] memory) {
        uint40 numberOfLeaves = self.numberOfLeaves;
        require(index < numberOfLeaves, "LazyIMT: leaf must exist");

        uint8 targetDepth = 1;
        while (uint40(2) ** uint40(targetDepth) < numberOfLeaves) {
            targetDepth++;
        }
        require(depth >= targetDepth, "LazyIMT: proof depth");
        // pass depth -1 because we don't need the root value
        uint256[] memory _elements = new uint256[](depth);
        _levels(self, numberOfLeaves, targetDepth - 1, _elements);

        // unroll the bottom entry of the tree because it will never need to
        // be pulled from _levels
        if (index & 1 == 0) {
            if (index + 1 >= numberOfLeaves) {
                _elements[0] = _defaultZero(0);
            } else {
                _elements[0] = self.elements[_indexForElement(0, index + 1)];
            }
        } else {
            _elements[0] = self.elements[_indexForElement(0, index - 1)];
        }
        index >>= 1;

        for (uint8 i = 1; i < depth; ) {
            uint256 currentLevelCount = numberOfLeaves >> i;
            if (index & 1 == 0) {
                // if the element is an uncomputed edge node we'll use the value set
                // from _levels above
                // otherwise set as usual below
                if (index + 1 < currentLevelCount) {
                    _elements[i] = self.elements[_indexForElement(i, index + 1)];
                } else if (((numberOfLeaves - 1) >> i) <= index) {
                    _elements[i] = _defaultZero(i);
                }
            } else {
                _elements[i] = self.elements[_indexForElement(i, index - 1)];
            }
            unchecked {
                index >>= 1;
                i++;
            }
        }
        return _elements;
    }
}
