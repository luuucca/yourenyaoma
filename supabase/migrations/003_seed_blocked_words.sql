-- 违禁词种子（v1）。可在管理员后台增删。
insert into public.blocked_words (word, category) values
  ('高仿', 'fake'), ('仿牌', 'fake'), ('复刻', 'fake'), ('A货', 'fake'), ('1:1', 'fake'),
  ('盗版', 'piracy'), ('破解版', 'piracy'),
  ('香烟', 'tobacco'), ('烟丝', 'tobacco'), ('烟弹', 'ecig'), ('电子烟', 'ecig'), ('vape', 'ecig'), ('juul', 'ecig'),
  ('大麻', 'drug'), ('CBD', 'drug'), ('THC', 'drug'), ('毒品', 'drug'), ('摇头丸', 'drug'),
  ('枪支', 'weapon'), ('弹药', 'weapon'), ('弹簧刀', 'weapon'), ('辣椒喷雾', 'weapon'), ('防身喷雾', 'weapon'),
  ('色情', 'porn'), ('援交', 'porn'),
  ('赌博', 'gambling'), ('博彩', 'gambling'),
  ('假证', 'fake_id'), ('假驾照', 'fake_id'), ('假身份证', 'fake_id'), ('假护照', 'fake_id'),
  ('自制食品', 'food'), ('自制蛋糕', 'food'),
  ('贷款', 'finance'), ('高利贷', 'finance'), ('投资理财', 'finance'),
  ('不问出处', 'stolen')
on conflict (word) do nothing;
