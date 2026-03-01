import { generateRecommendations } from '../components/Mood/utils/recommendEngine';

describe('generateRecommendations', () => {
  const menus = ['피자', '햄버거', '치킨', '파스타'];

  it('추천 결과는 최소 1개 이상이며, 입력된 메뉴 개수를 초과하지 않는다', () => {
    const result = generateRecommendations(menus);

    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThanOrEqual(menus.length);
  });

  it('추천 결과는 입력으로 받은 메뉴 목록 안에서만 선택된다', () => {
    const result = generateRecommendations(menus);

    expect(result.every(item => menus.includes(item))).toBe(true);
  });

  it('추천 결과에는 중복된 메뉴가 없어야 한다', () => {
    const result = generateRecommendations(menus);

    expect(new Set(result).size).toBe(result.length);
  });

  it('원본 메뉴 배열을 변경하지 않는다 (불변성 보장)', () => {
    const copy = [...menus];

    generateRecommendations(menus);

    expect(menus).toEqual(copy);
  });

  it('추천 과정에서 랜덤 로직(Math.random)을 사용한다', () => {
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.3);

    generateRecommendations(menus);

    expect(randomSpy).toHaveBeenCalled();

    randomSpy.mockRestore();
  });

  it('입력 메뉴가 충분하면 기본 추천 개수(6개)만큼 반환한다', () => {
    const manyMenus = ['1', '2', '3', '4', '5', '6', '7', '8'];

    const result = generateRecommendations(manyMenus);

    expect(result).toHaveLength(6);
    expect(new Set(result).size).toBe(6);
    expect(result.every(item => manyMenus.includes(item))).toBe(true);
  });

  it('입력 메뉴가 기본 추천 개수보다 적으면, 입력된 개수만큼 모두 반환한다', () => {
    const result = generateRecommendations(menus);

    expect(result).toHaveLength(menus.length);
    expect(new Set(result).size).toBe(menus.length);
  });
});
